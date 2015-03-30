// what page are we currently on? which have we been on before?
var current_page = 1;
var page_history = [];
var nav_history = [];

$(document).ready(function() {
    
    // initial page num will be planted in markup if not starting at 1
    var initial = $('#ajax-section').attr('data-initial-page');
    if(parseInt(initial)) {
        current_page = initial;
    }
    
    // bind history.js to state change
    History.Adapter.bind(window,'statechange',function() {
        // so we can't trust the browser history, or the url potentially...
        // need to work things out ourselves, serverside...
        
        var state = History.getState(); 
        
        if(!state.data.isHandled) {
            ajaxUpdate(state.data.direction, state.data.current_page, state.data.nav_history);
        } else if (!state.data.isFormTriggered) {
            // ... now what?? though the browser nav's are being picked up,
            // they're rolling over states that have already been handled!
            // re-pushing the state just triggers infinite loops...
        }
    });
    
    // are they trying to confirm back navigatin
    $('.go-back').click(function(e,ui) {
        e.preventDefault();
        if(!isNavBackPrompted('.go-back')) {
            warnify('.go-back');
            return;
        }
        if(isNavBackPrompted('.go-back') && !isNavBackConfirmed('.go-back')) {
            confirmify('.go-back');
            return;
        }
        if(isNavBackPrompted('.go-back') && isNavBackConfirmed('.go-back')) {
            deWarnify('.go-back');
            return;
        }
    });

    // setup the form submission ajax handling
    $('.go').click(function(e,ui){
        e.preventDefault();
        
        // get direction
        var direction = $(this).hasClass('go-back')? 'back' : 'forward';
        
        // if they're going backwards, make sure they've confirmed
        if (direction=='back') {
            
            if(!isNavBackConfirmed('.go-back')) {
                e.stopPropagation();
                return;
            }
        }
        
        pushPendingState(direction, current_page, nav_history, true);
    });
});

/**
 * do standard ajax call
 * 
 * @todo not sure what to do about the url bit here...
 * 
 * @param string direction must be forwards,backwards or null
 * @param int currentPage
 * @param array navHistory
 */
function ajaxUpdate(direction, currentPage, navHistory) {
    
    // do ajax call. we get an array in return telling us what pages we've been on before
    $.ajax({
        'url': '/page_history',
        'data': {
            'direction': direction,
            'current_page': currentPage,
            'request_url': History.getState().url,
            'navigation_history': JSON.stringify(navHistory)
            },
        'success': handleResponse
    });
}

/**
 * @brief set the back button to warning mode
 * @param string selector
 */
function warnify(selector){
    $(selector).val('Are you SURE you want to go back?');
    $(selector).attr('data-nav-back-prompted','true');
    $(selector).attr('data-nav-back-confirmed','false');
}

/**
 * @brief unset the back button from warning mode
 * @param string selector
 */
function deWarnify(selector) {
    $(selector).val('back');
    $(selector).attr('data-nav-back-prompted','false');
    $(selector).attr('data-nav-back-confirmed','false');
}

/**
 * @brief set navback confirmation
 */
function confirmify(selector) {
    $(selector).attr('data-nav-back-confirmed','true');
}

/**
 * @brief check confirmation status
 * @return bool
 */
function isNavBackConfirmed(selector) {
    var prompted = ($(selector).attr('data-nav-back-prompted')=='true');
    var confirmed = ($(selector).attr('data-nav-back-confirmed')=='true');
    return (prompted && confirmed);
}

/**
 * @brief check prompt status
 * @return bool
 */
function isNavBackPrompted(selector) {
    return ($(selector).attr('data-nav-back-prompted')=='true');
}

/**
 * @brief push a new state onto the stack. 
 * 
 * this'll trigger an window.statechange which will then do some ajax stuff
 * since we won't know the new page at this stage, we'll depend on updating that later
 * 
 * @param string direction must be forwards,backwards or null
 * @param int currentPage
 * @param array navHistory
 * @param bool formTriggered
 */
function pushPendingState(direction, currentPage, navHistory, formTriggered)
{
    var newUrl = History.getState().url;
    var newState = {
        'direction': direction,
        'current_page': currentPage,
        'navigation_history': JSON.stringify(navHistory),
        'isHandled': false,
        'isFormTriggered': formTriggered
    };
    History.pushState(newState,null,newUrl);
}

/**
 * @brief take a page history array, store data and update content
 */
function handleResponse(data)
{
    var prev_current_page = current_page;
    page_history = data['page_history'];
    current_page = data['current_page'];
    
    $('#ajax-section .content').html(current_page);
    
    deWarnify('.go-back');
    
    nav_history.push(current_page);
    
    // update the state with real info now that it's not pending
    var newState = History.getState();    
    newState.isHandled = true;
    newState.data.nav_history = nav_history;
    newState.data.direction = data['direction'];
    History.replaceState(newState, newState.title, '/page/'+current_page);
}

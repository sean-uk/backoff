// what page are we currently on? which have we been on before?
var current_page = 1;
var page_history = [];

$(document).ready(function() {
    
    // initial page num will be planted in markup if not starting at 1
    var initial = $('#ajax-section').attr('data-initial-page');
    if(parseInt(initial)) {
        current_page = initial;
    }
    
    // bind history.js to state change
    History.Adapter.bind(window,'statechange',function() {
        
    });
    
    // are they trying to confirm back navigatin
    $('.go-back').click(function(e,ui){
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
        
        ajaxUpdate(direction);
        
    });
});

/**
 * do standard ajax call
 */
function ajaxUpdate(direction) {
    // do ajax call. we get an array in return telling us what pages we've been on before
    $.ajax({
        'url': '/page_history',
        'data': {
            'direction': direction,
            'current_page': current_page
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
 * @brief take a page history array, store data and update content
 */
function handleResponse(data)
{
    page_history = data['page_history'];
    current_page = data['current_page'];
    
    $('#ajax-section .content').html(current_page);
    
    deWarnify('.go-back');
    
    // push new history state
    var new_url = '/page/'+current_page;
    History.pushState(null,null,new_url);
}

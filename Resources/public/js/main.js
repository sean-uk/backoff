// what page are we currently on? which have we been on before?
var current_page = 1;
var page_history = [];

$(document).ready(function(){
    
    // bind history.js to state change
    History.Adapter.bind(window,'statechange',function() {
        
    });

    // setup the form submission ajax handling
    $('.go').click(function(e,ui){
        e.preventDefault();
        
        // get direction
        var direction = $(this).hasClass('go-back')? 'back' : 'forward';
        
        // do ajax call. we get an array in return telling us what pages we've been on before
        $.ajax({
            'url': '/page_history',
            'data': {
                'direction': direction,
                'current_page': current_page
                },
            'success': handleResponse
        });
    });
});

/**
 * @brief take a page history array, store data and update content
 */
function handleResponse(data)
{
    page_history = data['page_history'];
    current_page = data['current_page'];
    
    $('#ajax-section .content').html(current_page);
    
    // push new history state
    var new_url = '?page='+current_page;
    History.pushState(null,null,new_url);
}

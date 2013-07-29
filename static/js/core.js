function ajax_post(url, data, callbacks){
    data['is_ajax'] = true
    var jqxhr = $.post(url, data, function(text_response){
        response = eval('(' + text_response + ')')
        if(response.success == true){
            if (callbacks['success'])
                callbacks['success'](response);
            else
                alert(response.success);
        }else{
            if (callbacks['error'])
                callbacks['error'](response);
            else
                alert(response.success);
        }
    }).always(function(){
        if (callbacks['always'])
            callbacks['always']();
    }).fail(function(){
        if (callbacks['failed'])
            callbacks['failed']();
    });
}

function login(){
    button = $('#login-btn')
    $(button).button('loading')
    username = $('input[name=username]').val()
    password = $('input[name=password]').val()
    $('.well .alert').fadeOut(200).remove()
    ajax_post(SETTINGS['api']['login'],
              {'username': username, 'password': password},
              {'success': function(response){
                    window.location = response.redirect
               },
               'error': function(response){
                    console.log(response)
                    $(template_html_alert('error', response['error'])).hide().appendTo('.well').fadeIn(600)
               },
               'failed': function(){
                    $(template_html_alert('error', response['error'])).hide().appendTo('.well').fadeIn(600)
                },
               'always': function(){
                    $(button).button('reset')
               },
              })
}
function get_info(){
    $('#timeline-navbar .navbar-inner ul li a img.loading').fadeIn(200)
    ajax_post(SETTINGS['api']['info'],
        {},
        {'success': function(response){
            SETTINGS['info']['user'] = response.user
            SETTINGS['info']['server'] = response.server
            
            $('#timeline-navbar .navbar-inner .brand .avatar').attr('src', SETTINGS['info']['user'].avatar)
            $('#status-length-limit').html(SETTINGS['info']['server']['length_limit'])
            
            SETTINGS['info']['user']['friends_list'] = []
            for(i=SETTINGS['info']['user']['friends'].length-1; i>=0; i--){
                friend = SETTINGS['info']['user']['friends'][i]
                SETTINGS['info']['user']['friends_list'][i] = {}
                SETTINGS['info']['user']['friends_list'][i]['id'] = friend['id']
                SETTINGS['info']['user']['friends_list'][i]['name'] = friend['screen_name']
                SETTINGS['info']['user']['friends_list'][i]['avatar'] = friend['profile_image_url']
                SETTINGS['info']['user']['friends_list'][i]['type'] = 'friend'
            }
            
            _jquery_plugin_attach()
        },
        'error': function(response){
            console.log(response)
        },
        'failed': function(){},
        'always': function(){
            $('#timeline-navbar .navbar-inner ul li a img.loading').fadeOut(200)
            timeline_update(20000, 'refresh')
        }})

}

function set_notice_as_read(notice_object_id){
    ajax_post(SETTINGS['api']['read'],
             {'notice': notice_object_id},
             {'success': function(response){
                $('.notice[data-notice=' + response.notice_id + '] > .notice-holder').addClass('read')
                $('li.stream-item a[href="#status-home-' + response.notice_id + '"]').parent().remove()
                SETTINGS['stream_count'] -= 1
                template_update_stream_count()
              },
              'error': function(response){
                console.log(response)
                $(notice_html_).removeClass('read')
              },
              'failed': function(){},
              'always': function(){}
              })
}

function timeline_update(seconds, event){
    var interval = seconds
    if(!event)
        event = ''
    $('#timeline-navbar .navbar-inner ul li a img.loading').fadeIn(200)
    ajax_post(SETTINGS['api']['home'], {'event': event},
              {'success': function(response){
                    DEBUG = response
                    html = $('#timeline #timeline-container #timeline-content')
                    html = template_timeline_notices(response.home_timeline, html)
               },
               'error': function(response){
                    console.log(response['error'])
               },
               'failed': function(){ },
               'always': function(){
                    $('#timeline-navbar .navbar-inner ul li a img.loading').fadeOut(200)
                    if(interval)
                        setTimeout(function(){ console.log('updating...'); timeline_update(interval); }, interval)
               }})
}

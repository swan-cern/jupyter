import $ from 'jquery';
import Jupyter from 'base/js/namespace';
import events from 'base/js/events';

import 'pnotify/dist/pnotify.css';
import 'pnotify/dist/pnotify.buttons.css';
import 'pnotify/dist/pnotify.buttons';
import 'pnotify/dist/pnotify.callbacks';
import PNotify from 'pnotify';

import configs from './configs.json'

/**
 * This extensions checks for Jupyterhub /status endpoint to get notifications
 * for the user, and displays them in the interface.
 * It uses the browser local storage to keep hidden messaged already seen.
 */

var notifications = [];
var seen_notifications = [];


/**
 * Start the extension.
 * If inside the notebook editor, check for updated in timed intervals
 * If inside the tree view, attach to the file list update event.
 */
function load_ipython_extension() {

    load_events();

    if(Jupyter.notebook != null) {
        setInterval(function() {
            load_events();
        }, 60 * 1000);
    } else {
        events.on('draw_notebook_list.NotebookList', function () {
            load_events();
        });
    }
}

/**
 * Checks jupyterhub for messages to the logged user.
 * Checks if they were already displayed.
 */
function load_events() {

    $.get(configs.endpoint, function (json) {

        // Get all the IDs of seen notifications from local storage.
        // This includes all the notifications dismissed in other tabs/windows.
        var local_storage = localStorage.getItem(configs.local_storage_name);
        if(local_storage != null) {
            seen_notifications = local_storage.split(',');
        }

        var current_ids = [];

        // Keep track of current message IDs displayed to prevent duplication
        $.each(json, function(k, notification) {
            show_notification(notification);
            current_ids.push(""+notification.id);
        });

        //Add removed notifications from other windows to seen list for cleanup
        $.each(notifications, function(id, notification) {

            if(notification != null && $.inArray(""+id, current_ids) === -1) {
                seen_notifications.push(id);
            }
        });

        remove_seen_notifications();

        //Clean old ids from local storage
        $.each(seen_notifications, function(k, id) {
            if(id != null && $.inArray(id, current_ids) === -1) {
                seen_notifications.splice(k, 1);
            }
        });

        localStorage.setItem(configs.local_storage_name, seen_notifications.join(','));
    }, "json");
}

/**
 * Display a notification in the browser if it hasn't already been displayed or dismissed.
 * @param notification Object with information info from Jupyterhub
 */
function show_notification(notification) {

    if (!(notification.id in notifications) && $.inArray(""+notification.id, seen_notifications) === -1) {

        var object = new PNotify({
            text: notification.message,
            type: notification.level,
            styling: 'fontawesome',
            cornerclass: 'ui-pnotify-sharp',
            addclass: "stack-bottomright",
            stack: configs.stack,
            shadow: false,
            hide: false, //hide auto
            remove: true,
            buttons: {
                sticker: false
            },
            after_close: function() {
                on_close(notification.id);
            }
        });

        notifications[notification.id] = {
            notification: notification,
            visible: true,
            object: object
        }
    }
}

/**
 * Handler for notification dismiss on the interface.
 * Some notifications cannot be dismissed.
 * @param id Notification ID
 */
function on_close(id) {
    notifications[id].visible = false;

    if(notifications[id].notification.dismissible && $.inArray(""+id, seen_notifications) === -1) {
        seen_notifications.push(id);
        localStorage.setItem(configs.local_storage_name, seen_notifications.join(','));
    }
}

/**
 * Clear notifications already seen in another window/tab.
 * If the user has multiple tabs open and dismisses a notification, it should
 * disappear on all tabs.
 */
function remove_seen_notifications() {

    $.each(seen_notifications, function(k, id) {
        if (id in notifications &&
            notifications[id].visible) {

            notifications[id].object.remove();
            notifications[id].visible = false;
        }
    });
}

export { load_ipython_extension }
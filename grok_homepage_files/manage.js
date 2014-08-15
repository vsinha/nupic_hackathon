/* ----------------------------------------------------------------------
 *  Copyright (C) 2006-2013 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

    GROKUI.ManageView = Backbone.View.extend({

        template: _.template($('#manage-tmpl').html()),

        msgs: GROKUI.msgs('manage-tmpl'),
        site: GROKUI.msgs('site'),

        events: {
        },

        initialize: function(options) {
            var me = this;

            me.api = options.api;

            GROKUI.utils.title(me.msgs.title);

            // go setup if they have not yet
            if(! GROKUI.utils.isAuthorized()) {
                GROKUI.utils.go(me.site.paths.welcome);
                return;
            }

            me.render();
        },

        render: function() {
            var me = this,
                data = {
                    baseUrl: NTA.baseUrl,
                    msgs: me.msgs,
                    site: me.site
                },
                instanceListView = null,
                embedView = null;

            me.$el.html(me.template(data));

            instanceListView = new GROKUI.InstanceListView({
                el:     $('#instance-list'),
                api:    me.api,
                site:   me.site
            });
            instanceListView.render();

            embedView = new GROKUI.EmbedFormView({
                el: $('#embed-form'),
                api: me.api
            });
            embedView.render();

            me.trigger('view-ready');
            return me;
        }

    });

})();

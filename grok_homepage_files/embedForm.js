/* ----------------------------------------------------------------------
 *  Copyright (C) 2014 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

    GROKUI.EmbedFormView = Backbone.View.extend({

        template: _.template($('#embed-form-tmpl').html()),

        msgs: GROKUI.msgs('embed-form-tmpl'),
        site: GROKUI.msgs('site'),

        events: {
            'input #domain': 'handleInputChange',
            'input #height': 'handleInputChange',
            'input #width':  'handleInputChange'
        },

        initialize: function() {
            ZeroClipboard.config({
                moviePath: NTA.baseUrl +
                    "/static/bower_components/zeroclipboard/ZeroClipboard.swf"
            });
        },

        render: function() {
            var data = {
                    baseUrl:    NTA.baseUrl,
                    msgs:       this.msgs,
                    site:       this.site
                };

            this.$el.html(this.template(data));
            $('#form').submit(function(e) {
               return false; 
            });

            this.enableCopy();
            this.handleInputChange();

            this.trigger('view-ready');
        },

        enableCopy: function() {
            var $copiedEl = $("#copied"),
                $codeEl = $("#code"),
                client = new ZeroClipboard($(".btn-copy"));

            client.on("complete", function(client, args) {
                $codeEl.focus();
                $codeEl.select();
                $copiedEl.show();
            });
        },

        handleInputChange: function(event) {
            var me = this,
                domainEl = $("#domain"),
                domain = domainEl.val(),
                formEl = $('#form'),
                widthEl =  $("#width"),
                heightEl = $("#height"),
                width =  widthEl.val(),
                height = heightEl.val(),
                codeEl = $("#code"),
                copyEl = $("#copy");

            codeEl.val("");
            copyEl.attr('disabled', 'disabled');

            // Check validity
            if (!(formEl[0].checkValidity() && domainEl[0].checkValidity() && widthEl[0].checkValidity() && heightEl[0].checkValidity())) {
                // Force HTML5 Form validation by clicking on the submit button
                copyEl.removeAttr('disabled');
                copyEl.click();
                copyEl.attr('disabled', 'disabled');
                return;
            }

            if (domain.length && width.length && height.length) {
                codeEl.val(me.generateCode(domain, width, height));
                copyEl.removeAttr('disabled');

                /* From http://stackoverflow.com/a/106223 */
                var validIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                    validHostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

                if (validIpAddressRegex.test(domain) || validHostnameRegex.test(domain)) {
                    domainEl.tooltip('destroy');
                }
                else {
                    domainEl.tooltip({"title": "This doesn't look like a valid hostname."});
                    domainEl.tooltip('show');
                }
            }
        },

        generateCode: function(domain, width, height) {
            var me = this,
                apiKey = GROKUI.utils.store.get('apiKey'),
                hash = Crypto.SHA1(apiKey + domain),
                serverURL = 'http://' + window.location.hostname +
                            "/grok/embed/charts",
                code = "<iframe width=\"" + width + "\" " +
                        "height=\"" + height + "\" " +
                        "style=\"border:0\" " +
                        "src=\"" + serverURL +
                        "?hash=" + hash +
                        "&width=" + width + "&height=" + height +
                        "\"></iframe>";

            return code;
        }

    });

})();

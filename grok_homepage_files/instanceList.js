/* ----------------------------------------------------------------------
 *  Copyright (C) 2006-2013 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

    GROKUI.InstanceListView = Backbone.View.extend({

        // Backbone.View properties

        template: _.template($('#instance-list-tmpl').html()),

        events: {
            'click .metric-link':       'handleMetrics',
            'click td button.close':    'handleDeleteOne',
            'click .delete':            'handleDeleteAll',
            'click .export':            'handleExport'
        },

        // Custom properties

        api:    null,
        msgs:   GROKUI.msgs('instance-list-tmpl'),
        site:   GROKUI.msgs('site'),

        data: {
            autostacks: null,
            customs:    null,
            exports:    null,
            instances:  null,
            metrics:    null,
            models:     null,
            namespaces: null
        },

        // Backbone.View methods

        /**
         *
         */
        initialize: function(options) {
            var me = this,
                collectOpts = {
                    api:    options.api,
                    site:   options.site
                },
                fetchOpts = {
                    error: function(model, response, options) {
                        return GROKUI.utils.modalError(response);
                    }
                },
                dataExists = function(key) {
                    return (key && options.data && options.data[key] && (options.data[key] instanceof Backbone.Collection));
                },
                fetchList = []; // missing data queued here for loading

            this.api = options.api;

            // Prep Collections - data passed in, or create here

            this.data.autostacks = dataExists('autostacks') ?
                options.data.autostacks :
                new GROKUI.GrokAutostacksCollection([], collectOpts);

            this.data.customs = dataExists('customs') ?
                options.data.customs :
                new GROKUI.GrokCustomMetricsCollection([], collectOpts);

            this.data.exports = dataExists('exports') ?
                options.data.exports :
                new GROKUI.ModelExportsCollection([], collectOpts);

            this.data.instances = dataExists('instances') ?
                options.data.instances:
                new GROKUI.InstancesCollection([], collectOpts);

            this.data.metrics = dataExists('metrics') ?
                options.data.metrics :
                new GROKUI.AwsMetricsCollection([], collectOpts);

            this.data.models = dataExists('models') ?
                options.data.models :
                new GROKUI.ModelsCollection([], collectOpts);

            this.data.namespaces = dataExists('namespaces') ?
                options.data.namespaces :
                new GROKUI.AwsNamespacesCollection([], collectOpts);

            // Prep Collections - data passed in, or fetch here

            if(this.data.autostacks.length <= 0) {
                fetchList.push(this.data.autostacks.fetch(fetchOpts));
            }
            if(this.data.customs.length <= 0) {
                fetchList.push(this.data.customs.fetch(fetchOpts));
            }
            if(this.data.instances.length <= 0) {
                fetchList.push(this.data.instances.fetch(fetchOpts));
            }
            if(this.data.namespaces.length <= 0) {
                fetchList.push(this.data.namespaces.fetch(fetchOpts));
            }

            // add listeners to this view

            this.listenTo(this.data.instances, 'sync', function() {
                // reload models if instances change
                this.data.models.fetch({
                    error: function(model, response, options) {
                        return GROKUI.utils.modalError(response);
                    }
                });

                this.render();
            }.bind(this));

            // fetch if necessary
            if(fetchList.length > 0) {
                $.when.apply($, fetchList).done(function() {
                    // no-op for now
                });
            }
        },

        /**
         *
         */
        render: function() {
            var me = this,
                data = {
                    baseUrl: NTA.baseUrl,
                    msgs: me.msgs,
                    site: me.site,
                    instances: me.data.instances
                };

            me.$el.html(me.template(data));

            if(me.data.instances.length > 0) {
                me.$el.css('opacity', 1);
                $('.tablesorter').tablesorter();
            }
            else {
                // no instances, mute listing
                me.$el.css('opacity', 0.5);
            }

            me.trigger('view-ready');
            return me;
        },

        // Custom methods

        /**
         * instance title is clicked in order to customize metrics for instance
         */
        handleMetrics: function(event) {
            var $node = $(event.currentTarget),
                $row = $node.parents('tr'),
                region = $row.data('region'),
                namespace = $row.data('namespace'),
                instance = $row.data('instance'),
                regionNamespaceFilter = {
                    region:     region,
                    namespace:  namespace
                },
                regionNamespaceMetrics = this.data.metrics.where(regionNamespaceFilter),
                isGrokAutostack = namespace.match(this.site.instances.types.autostack),
                isGrokCustomMetric = namespace.match(this.site.namespaces.grok.custom),
                makeView = function() {
                    var modalMetricList = new GROKUI.ModalMetricListView({
                        api:        this.api,
                        region:     region,
                        namespace:  namespace,
                        instance:   instance,
                        name:       $row.data('name'),
                        data: {
                            autostacks: this.data.autostacks,
                            customs:    this.data.customs,
                            metrics:    this.data.metrics,
                            models:     this.data.models,
                            namespaces: this.data.namespaces
                        }
                    });
                    modalMetricList.bind('view-closed', function() {
                        // if they turned all metrics off, instance will now be gone,
                        //  so reload instance list.
                        this.data.instances.fetch({
                            error: function(model, response, options) {
                                return GROKUI.utils.modalError(response);
                            },
                            success: function(model, response, options) {
                                GROKUI.utils.throb.stop();
                            }
                        });
                    }.bind(this));

                    return modalMetricList;
                }.bind(this);

            event.stopPropagation();
            event.preventDefault();

            GROKUI.utils.throb.start(this.site.state.metric.load);

            if(
                (! isGrokAutostack) &&
                (! isGrokCustomMetric) &&
                (regionNamespaceMetrics.length <= 0)
            ) {
                // Metric data for this region not loaded yet, do so.
                // Make sure to fetch all metrics and autostacks collections.
                $.when(this.data.metrics.fetch({
                            region:     region,
                            namespace:  namespace,
                            remove:     false}),
                       this.data.autostacks.fetch({
                            region:     region,
                            namespace:  namespace,
                            remove:     false})
                        ).
                    done(function(model) {
                        GROKUI.utils.throb.stop();
                        var view = makeView();
                        view.render();
                    }).            
                    fail(function(xhr, error, response) {
                        GROKUI.utils.throb.stop();
                        return GROKUI.utils.modalError(response);                        
                    });
            }
            else {
                // Metric data for this region already loaded, continue.
                GROKUI.utils.throb.stop();
                var view = makeView();
                view.render();
                return view;
            }
        },

        /**
         * Actually remove instance(s) from monitoring (delete models).
         *  Use recursion so if there is a problem the loop won't keep dumbly
         *  running forever.
         */
        performDelete: function(list, index) {
            index = index || 0;

            var percent = 0,
                errorCallback = function(model, response, options) {
                    GROKUI.utils.throb.stop();
                    return GROKUI.utils.modalError(response);
                },
                destroyOpts = {
                    error: errorCallback,
                    success: function(model, response, options) {
                        // update % in throbber
                        percent = Math.round((index / list.length) * 100);
                        GROKUI.utils.throb.message(
                            this.site.state.instance.stop +
                            ' (' + percent + '%)'
                        );

                        // next recursion
                        this.performDelete(list, index + 1);
                    }.bind(this)
                };

            if(index < list.length) {
                // continue recursive loop
                var item = list[index],
                    itemParts = item.split("/"),
                    namespace = itemParts[0],
                    id = itemParts[1];

                if(namespace.match(this.site.instances.types.autostack)) {
                    // destroy autostack
                    this.data.autostacks.get(id).destroy(destroyOpts);
                }
                else {
                    // destroy regular instance
                    this.data.instances.get(item).destroy(destroyOpts);
                }
            }
            else {
                // all done with recursive loop
                this.data.instances.fetch({
                    error: errorCallback,
                    success: function(model, response, options) {
                        GROKUI.utils.throb.stop();
                    }
                });
            }
        },

        /**
         * User clicked delete button on 1 instance row
         */
        handleDeleteOne: function(event) {
            var me = this,
                $row = $(event.currentTarget).parents('tr'),
                region,
                instance = $row.data('instance'),
                name = $row.data('name'),
                display;

            event.stopPropagation();
            event.preventDefault();

            $row.addClass('bg-danger');

            if($row.data('region')) {
                region = $row.data('region');
                namespace = $row.data('namespace');
            }
            else {
                region = me.site.name + ' ' + me.site.regions.grok.custom;
                namespace = me.site.namespaces.grok.custom;
            }

            display = '<code class="truncate">' + [
                region,
                namespace,
                name
            ].join(' <span class="text-muted">&gt;</span> ') + '</code>';

            // ask user to confirm instance delete
            bootbox.confirm({
                animate:    false,
                message:    '<div>Remove this instance from monitoring?</div>' + display,
                title:      'Remove',
                callback:   function(result) {
                    if(result) {
                        $row.fadeOut();
                        GROKUI.utils.throb.start(me.site.state.instance.stop);
                        me.performDelete([instance]);
                    }
                    else {
                        $row.removeClass('bg-danger');
                    }
                }
            });
        },

        /**
         * User clicked Remove All button
         */
        handleDeleteAll: function(event) {
            var me = this,
                $rows = me.$el.find('.instances > tr'),
                instances = [];

            event.stopPropagation();
            event.preventDefault();

            $rows.addClass('bg-danger');

            $rows.each(function() {
                var instance = $(this).data('instance');
                if(instance) {
                    instances.push(instance);
                }
            });

            if(instances.length > 0) {
                // ask user to confirm instance delete
                bootbox.confirm({
                    animate:    false,
                    message:    'Remove all <strong>' + instances.length + '</strong> instances from monitoring?',
                    title:      'Remove All',
                    callback:   function(result) {
                        if(result) {
                            $rows.fadeOut();
                            GROKUI.utils.throb.start(me.site.state.instance.stop);
                            me.performDelete(instances);
                        }
                        else {
                            $rows.removeClass('bg-danger');
                        }
                    }
                });
            }
        },

        /**
         * User clicked Export All button
         */
        handleExport: function(event) {
            event.stopPropagation();
            event.preventDefault();

            GROKUI.utils.throb.start(this.site.state.loading);

            this.data.exports.fetch({
                error: function(collection, response, options) {
                    return GROKUI.utils.modalError(error);
                },
                success: function(collection, response, options) {
                    var blob = new Blob(
                            [ JSON.stringify(collection) ],
                            { type: "text/json;charset=utf-8;" }
                        ),
                        when = (new Date()).toISOString().replace(/[\WT]/g,'').slice(0, 14);

                    GROKUI.utils.throb.stop();
                    saveAs(blob, 'grok-export-' + when + '.json');
                }
            });
        }

    });

})();

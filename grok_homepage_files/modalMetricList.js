/* ----------------------------------------------------------------------
 *  Copyright (C) 2006-2013 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

    GROKUI.ModalMetricListView = Backbone.View.extend({

        // Backbone.View properties

        template: _.template($('#modal-metric-list-tmpl').html()),

        events: {
        },

        // Custom properties

        msgs: GROKUI.msgs('modal-metric-list-tmpl'),
        site: GROKUI.msgs('site'),

        $modal: null,

        api:        null,
        instance:   null,
        id:         null,
        name:       null,
        namespace:  null,
        region:     null,

        data: {
            autostacks: null,
            customs:    null,
            metrics:    null,
            models:     null,
            namespaces: null
        },

        autostackData:  null,
        creators:       null,
        metrics:        null,

        // Backbone.View methods

        /**
         * Backbone.View.initalize()
         */
        initialize: function(options) {
            this.api =        options.api;
            this.instance =   options.instance;
            this.id =         options.instance.split('/').pop();

            this.name =       options.name;
            this.namespace =  options.namespace;
            this.region =     options.region;

            this.data.autostacks =  options.data.autostacks;
            this.data.customs =     options.data.customs;
            this.data.metrics =     options.data.metrics;
            this.data.models =      options.data.models;
            this.data.namespaces =  options.data.namespaces;

            this.autostackData =    {};
            this.creators =         {};
            this.metrics =          {};
        },

        /**
         * Backbone.View.render()
         */
        render: function() {
            var me = this,
                id = this.instance.split('/').pop();

            if(this.isGrokAutostack()) {
                // Prep data - get possible Grok Autostacks
                var grokAutostackNamespace =    this.data.namespaces.get('Autostacks'),
                    grokAutostackMetrics =      grokAutostackNamespace.get('metrics'),
                    awsEc2Namespace =           this.data.namespaces.get('AWS/EC2'),
                    awsEc2Metrics =             awsEc2Namespace.get('metrics');

                for(var i=0; i<grokAutostackMetrics.length; i++) {
                    var metric = grokAutostackMetrics[i];
                    me.metrics[metric] = false;
                    me.creators[metric] = new GROKUI.AwsMetricModel({
                        metric:     metric,
                        region:     me.region,
                        namespace:  grokAutostackNamespace.id,
                        identifier: me.instance
                    });
                }
                for(var i=0; i<awsEc2Metrics.length; i++) {
                    var metric = awsEc2Metrics[i];
                    me.metrics[metric] = false;
                    me.creators[metric] = new GROKUI.AwsMetricModel({
                        metric:     metric,
                        region:     me.region,
                        namespace:  awsEc2Namespace.id,
                        identifier: me.instance
                    });
                }

                var matchedAutostacks = this.data.autostacks.filter(
                    function(autostack) {
                        return(
                            (autostack.get('region') === me.region) &&
                            (autostack.id == id)
                        );
                    }
                );

                if (!matchedAutostacks.length) {
                    return GROKUI.utils.modalError("Autostack not found.");
                }

                var autostack = matchedAutostacks[0];

                this.autostackData.name = autostack.name;
                this.autostackData.region = autostack.region;
                this.autostackData.filters = JSON.stringify(autostack.filters);

                me.api.getAutostackPreview(
                    autostack.get('region'),
                    autostack.get('filters'),
                    function(error, instances) {
                        if(error) return GROKUI.utils.modalError(error);

                        var members = instances.map(function(instance) {
                            var name = instance.tags.Name,
                                id = instance.instanceID;

                            return name ? (name + " (" + id + ")") : id;
                        });

                        me.autostackData.members = members;
                    }
                );
            }
            else if(this.isGrokCustomMetric()) {
                // Prep data - get possible Grok Custom Metrics
                me.region = me.site.name + ' ' + me.site.regions.grok.custom;
                me.namespace = me.site.namespaces.grok.custom;

                me.data.customs.forEach(function(metric) {
                    // only want single current Grok Custom Metric
                    if(me.name === metric.get('name')) {
                        var key = metric.get('name');
                        me.metrics[key] = false;
                        me.creators[key] = metric;
                    }
                });
            }
            else {
                // Prep data - get possible regular Metrics
                var filter = {
                    region:     this.region,
                    namespace:  this.namespace,
                    identifier: id
                };

                this.data.metrics.where(filter).forEach(function(metric) {
                    var key = metric.get('metric');
                    this.metrics[key] = false;
                    this.creators[key] = metric;
                }.bind(this));
            }

            // got all the data, now mark which metrics are "on"
            this.data.models.forEach(function(model) {
                var instance = (this.isGrokAutostack() || this.isGrokCustomMetric()) ?
                        this.instance :
                        [ this.region, this.namespace, this.id ].join('/');

                if(
                    (instance === model.get('server')) &&
                    (Object.keys(this.metrics).indexOf(model.get('metric')) > -1)
                ) {
                    this.metrics[model.get('metric')] = model.id;
                }
            }.bind(this));

            // show dialog
            this.$modal = bootbox.dialog({
                animate:    false,
                message:    'Loading...',
                show:       false,
                title:      "Select Metrics to Monitor",
                buttons: {
                    done: {
                        label:      'Done',
                        className:  'btn-primary'
                    }
                }
            });
            this.$modal.on('hidden.bs.modal', function(event) {
                this.trigger('view-closed');
            }.bind(this));
            this.$modal.modal('show');

            var data = {
                baseUrl:        NTA.baseUrl,
                msgs:           this.msgs,
                site:           this.site,
                region:         this.region,
                namespace:      this.namespace,
                display:        this.name,
                metrics:        this.metrics,
                autostackData:  this.autostackData
            };
            var rendered = this.template(data);

            this.$modal.find('.bootbox-body').html(rendered);

            this.$modal.find('input[type="checkbox"]').each(function() {
                // dialog content into on/off switches
                var $el = $(this);
                $el.bootstrapSwitch();
                $el.on(
                    'switchChange.bootstrapSwitch',
                    me.handleCheckBoxClick.bind(me)
                );
            });

            this.trigger('view-ready');
            return this;
        },

        // Custom methods

        /**
         * Is this a Grok Autostack?
         * @returns {boolean}
         */
        isGrokAutostack: function() {
            return this.instance.match(this.site.instances.types.autostack);
        },

        /**
         * Is this a Grok Custom Metric?
         * @returns {boolean}
         */
        isGrokCustomMetric: function() {
            return this.namespace.match(this.site.namespaces.grok.custom);
        },

        /**
         * Handle a Metric toggle
         */
        handleCheckBoxClick: function(event, state) {
            var me = this,
                $node = $(event.currentTarget),
                metric = $node.data('metric'),
                checked = state,
                id = this.instance.split("/").pop(),
                modelFilter = {},
                models = null,
                modelId = null,
                newModel = (this.creators[metric].get('datasource') === 'custom') ?
                            {
                                datasource: this.creators[metric].get('datasource'),
                                metric: metric
                            } : this.creators[metric].toJSON();

            if(this.isGrokAutostack()) {
                modelFilter = {
                    location:   this.region,
                    server:     this.instance,
                    metric:     metric
                };
            }
            else if(this.isGrokCustomMetric()) {
                modelFilter = {
                    server: metric,
                    metric: metric
                };
            }
            else {
                modelFilter = {
                    location:   this.region,
                    server:     [ me.region, me.namespace, id ].join('/'),
                    metric:     metric
                };
            }

            models = this.data.models.where(modelFilter);

            modelId = (models.length > 0) ? models[0].id : null;

            if(checked && (metric in me.creators)) {
                GROKUI.utils.throb.start(me.site.state.metric.start);
                if(this.isGrokAutostack()) {
                    // create autostack
                    me.api.createAutostackMetrics(
                        id,
                        [{
                            metric:     this.creators[metric].get('metric'),
                            namespace:  this.creators[metric].get('namespace')
                        }],
                        function(error, response) {
                            if(error) return GROKUI.utils.modalError(error);
                            me.data.models.add({
                                datasource: me.creators[metric].get('datasource'),
                                location:   me.creators[metric].get('region'),
                                metric:     me.creators[metric].get('metric'),
                                server:     me.instance,
                                id:         response.metric.uid,
                                uid:        response.metric.uid
                            });
                            return GROKUI.utils.throb.stop();
                        }
                    );
                } else {
                    // create regular model
                    me.data.models.create(newModel, {
                        error: function(model, response, options) {
                            return GROKUI.utils.modalError(response);
                        },
                        success: function(model, response, options) {
                            return GROKUI.utils.throb.stop();
                        }
                    });
                }
            }
            else if((! checked) && modelId) {
                GROKUI.utils.throb.start(me.site.state.metric.stop);

                if (me.isGrokAutostack()) {
                    me.api.deleteAutostackMetric(id, modelId, function(error) {
                        if(error) return GROKUI.utils.modalError(error);
                        me.data.models.remove(me.data.models.get(modelId));
                        return me.data.models.fetch({
                            error: function(model, response, options) {
                                return GROKUI.utils.modalError(response);
                            },
                            success: function(model, response, options) {
                                return GROKUI.utils.throb.stop();
                            }
                        });
                    });
                } else {
                    me.data.models.get(modelId).destroy({
                        error: function(model, response, options) {
                            return GROKUI.utils.modalError(response);
                        },
                        success: function(model, response, options) {
                            return GROKUI.utils.throb.stop();
                        }
                    });
                }
            }
        }

    });

})();

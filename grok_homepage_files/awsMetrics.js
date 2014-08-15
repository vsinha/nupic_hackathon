/* ----------------------------------------------------------------------
 *  Copyright © 2006-2014 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

  /**
   * Backbone.js Collection for a group of AWS Metrics
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone, Backbone.Collection, GROKUI.AwsMetricModel
   * @returns {Object} Backbone.js Collection object
   */
  GROKUI.AwsMetricsCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.AwsMetricModel,

    // Custom properties

    api:    null,
    region: null,
    site:   null,

    // Backbone.Collection methods

    /**
     * Backbone.Collection.initalize()
     */
    initialize: function(models, options) {
      this.api = options.api;
      this.region = options.region;
      this.site = options.site;
    },

    /**
     * Backbone.Collection.sync()
     * Custom override for Backbone.sync(), since we're using our own API
     *  library REST calls, and not going to let Backbone do XHR directly.
     */
    sync: function(method, collection, options) {
      var options = options || {},
          result = null;

      switch(method) {
        case 'create':
          break;

        case 'read':
          if(('region' in options) && ('namespace' in options)) {
            // if we have both region+namespace filters, use faster api
            result = this.api.getInstanceMetrics(
              options.region,
              options.namespace,
              function(error, metrics) {
                if(error) return options.error(error);
                return options.success(metrics);
              }
            );
          }
          else if('region' in options) {
            // use slower api endpoint for region-only filtering
            result = this.api.getRegionDetails(
              options.region,
              function(error, metrics) {
                if(error) return options.error(error);
                return options.success(metrics);
              }
            );
          }
          break;

        case 'update':
          break;

        case 'delete':
          break;
      }

      return result;
    }

  });

}());

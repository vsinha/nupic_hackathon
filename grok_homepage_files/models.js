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
   * Backbone.js Collection for a group of Grok Metrics/Models, source being
   *  the /_models API endpoint.
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js, Grok ModelModel class
   * @returns {Object} Backbone.js Collection object
   */
  GROKUI.ModelsCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.ModelModel,

    // Custom properties

    api: null,

    // Backbone.Collection methods

    initialize: function(models, options) {
      this.api = options.api;
    },

    /**
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
          result = this.api.getModels(function(error, models) {
            if(error) return options.error(error);
            return options.success(models);
          });
          break;

        case 'update':
          break;

        case 'delete':
          break;
      }

      return result;
    },

    // Custom methods

    /**
     * Return this collection grouped by unique Instance ID/key/name
     * @returns {Object} List of Instances, each having child Metrics
     */
    groupByInstance: function() {
      return this.groupBy(
        function(model) {
          return model.get('server').split('/').pop();
        }
      );
    }

  });

  /**
   * Backbone.js Collection for a group of Grok Metrics/Models sorted by
   * anomaly, source being the /_anomalies API endpoint.
   * @author Austin Marshall <amarshall@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js, Grok ModelModel class
   * @returns {Object} Backbone.js Collection object
   */
  GROKUI.SortedModelsCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.ModelModel,

    // Custom properties

    api: null,
    //{Number} [range] Time, in seconds over which to sort
    period: 0,

    // Backbone.Collection methods

    initialize: function(models, options) {
      this.api = options.api;
      this.period = options.period || 2;
    },

    /**
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
          result = this.api.getModelsSortedByAnomaly(function(error, models) {
            if(error) return options.error(error);
            return options.success(models);
          }, this.period);
          break;

        case 'update':
          break;

        case 'delete':
          break;
      }

      return result;
    },

    // Custom methods

    /**
     * Return this collection grouped by unique Instance ID/key/name
     * @returns {Object} List of Instances, each having child Metrics
     */
    groupByInstance: function() {
      return this.groupBy(
        function(model) {
          return model.get('server').split('/').pop();
        }
      );
    }

  });

}());

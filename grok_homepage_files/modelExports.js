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
   * Backbone.Collection for a group of Grok Metric/Model Exports
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone, Backbone.Collection, GROKUI.ModelExportModel class
   * @returns {Object} Backbone.Collection object
   */
  GROKUI.ModelExportsCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.ModelExportModel,

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
          result = this.api.exportModels(function(error, models) {
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
          return model.get('parameters').InstanceId;
        }
      );
    }

  });

}());

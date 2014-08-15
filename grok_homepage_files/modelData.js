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
   * Backbone.js Model for a Grok Metric/Model's DATA (/_models/data endpoint)
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone, Backbone.Model
   * @returns {Object} Backbone.Model object
   */
  GROKUI.ModelDataModel = Backbone.Model.extend({

    // Backbone.Model properties

    // Custom properties

    api: null,

    // Backbone.Model methods

    /**
     * Backbone.Model.initalize()
     */
    initialize: function(model, options) {
      this.api = options.api;
    },

    /**
     * Backbone.Model.sync()
     * Custom override for Backbone.sync(), since we're using our own API
     *  library REST calls, and not going to let Backbone do XHR directly.
     */
    sync: function(method, model, options) {
      var options = options || {},
          filters = {},
          result =  null;

      switch(method) {
        case 'create':
          break;

        case 'read':
          [ 'anomaly', 'limit', 'from', 'to' ].forEach(function(key) {
            if(key in options) {
              filters[key] = options[key];
            }
          });

          result = this.api.getModelData(
            model.id,
            filters,
            function(error, response) {
              if(error) return options.error(error);
              return options.success(response);
            }
          );
          break;

        case 'update':
          break;

        case 'delete':
          break;
      }

      return result;
    }

    // Custom methods

  });

}());

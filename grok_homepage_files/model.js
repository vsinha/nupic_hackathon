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
   * Backbone.js Model for a Grok Metric/Model (/_models API endpoint result)
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js
   * @returns {Object} Backbone.js Model object
   */
  GROKUI.ModelModel = Backbone.Model.extend({

    // Backbone.Model properties

    idAttribute: 'uid',

    // Custom properties

    // Backbone.Model methods

    /**
     * Backbone.Model.parse()
     */
    parse: function(response, options) {
      if('name' in response) {
        response.metric = response.name.split('/').pop();
      }

      return response;
    },

    /**
     * Backbone.Model.sync()
     * Custom override for Backbone.sync(), since we're using our own API
     *  library REST calls, and not going to let Backbone do XHR directly.
     */
    sync: function(method, model, options) {
      var options = options || {},
          result = null;

      switch(method) {
        case 'create':
          result = this.collection.api.createModels(
            model,
            function(error, response) {
              if(error) return options.error(error);
              return options.success(response[0]);
            }
          );
          break;

        case 'read':
          break;

        case 'update':
          break;

        case 'delete':
          result = this.collection.api.deleteModel(
            model.id,
            function(error, response) {
              if(error) return options.error(error);
              return options.success();
            }
          );
          break;
      }

      return result;
    }

    // Custom methods

  });

}());

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
   * Backbone.Model for a single Grok Autostack
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone, Backbone.Model
   * @returns {Object} Backbone.Model object
   */
  GROKUI.GrokAutostackModel = Backbone.Model.extend({

    // Backbone.Model properties

    idAttribute: 'uid',

    // Custom properties

    // Backbone.Model methods

    /**
     * Backbone.Model.parse()
     */
    parse: function(response, options) {
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
          break;

        case 'read':
          break;

        case 'update':
          break;

        case 'delete':
          result = this.collection.api.deleteAutostack(
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

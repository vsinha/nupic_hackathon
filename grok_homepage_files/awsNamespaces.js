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
   * Backbone.js Collection for a group of AWS Namespaces
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone, Backbone.Collection, GROKUI.AwsNamespaceModel
   * @returns {Object} Backbone.Collection object
   */
  GROKUI.AwsNamespacesCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.AwsNamespaceModel,

    // Custom properties

    api: null,

    // Backbone.Collection methods

    /**
     * Backbone.Collection.initalize()
     */
    initialize: function(models, options) {
      this.api = options.api;
    },

    /**
     * Backbone.Collection.parse()
     * Handle the fetch/sync response, repack to Backbone.Model format
     * @returns {Array} List of Backbone.Model objects to create
     */
    parse: function(namespaces) {
      var results = Object.keys(namespaces).sort().map(function(namespace) {
        var result = namespaces[namespace];
        result.id = namespace;
        return result;
      });
      return results;
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
          result = this.api.getNamespaces(function(error, namespaces) {
            if(error) return options.error(error);
            return options.success(namespaces);
          });
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

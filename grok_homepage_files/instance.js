/* ----------------------------------------------------------------------
 *  Copyright © 2006-2014 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

  var CONST = {
    STATUS: {
      UNKNOWN: {
        CODE: 0,
        NAME: 'Unknown'
      },
      ACTIVE: {
        CODE: 1,
        NAME: 'Active'
      },
      CREATE: {
        CODE: 2,
        NAME: 'Creating'
      },
      ERROR: {
        CODE: 4,
        NAME: 'Error'
      },
      PENDING: {
        CODE: 8,
        NAME: 'Pending'
      }
    }
  };

  /**
   * Backbone.js Model for a Grok Monitored Instance (/_instances API endpoint)
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js
   * @returns {Object} Backbone.js Model object
   */
  GROKUI.InstanceModel = Backbone.Model.extend({

    // Backbone.Model properties

    idAttribute: 'server',

    defaults: {
      status:       CONST.STATUS.CREATE.CODE,
      statusName:   CONST.STATUS.CREATE.NAME
    },

    // Custom properties

    CONST: CONST,

    // Backbone.Model methods

    /**
     * Backbone.Model.parse()
     */
    parse: function(response, options) {
      if(
        (!('server' in response)) &&
        ('_server' in response)
      ) {
        response.server = response._server;
      }

      response = this.parseLocation(response);
      response = this.parseDisplayName(response);
      response = this.parseStatusName(response);
      response = this.parseStatusMessage(response);
      return response;
    },

    /**
     * Backbone.Model.sync()
     */
    sync: function(method, model, options) {
      var options = options || {},
          result = null;

      switch(method) {
        case 'create':
          result = this.collection.api.createMonitoredInstance(
            model.get('location'),
            model.get('namespace'),
            model.get('instance'),
            function(error) {
              if(error) return options.error(error);
              return options.success(model.toJSON());
            }
          );
          break;

        case 'read':
          break;

        case 'update':
          break;

        case 'delete':
          result = this.collection.api.deleteMonitoredInstances(
            [ model.id ],
            function(error) {
              if(error) return options.error(error);
              return options.success();
            }
          );
          break;
      }

      return result;
    },

    // Custom methods

    /**
     *
     */
    parseDisplayName: function(instance) {
      var site = this.collection.site,
          id = instance.server.split('/').pop(),
          isAutoScaleGroup = function(value) {
            return value.match(site.instances.types.autoscale);
          };

      if(instance.namespace.match(site.namespaces.aws.real) &&
         instance.server.match(site.instances.types.autostack)) {
        // Grok Autostack pretty dipslay name
        instance.display =
          instance.name + ' (' +
          site.name + ' ' +
          site.instances.types.autostack +
          ')';
      }
      else if(instance.name && (instance.name !== id)) {
        // regular display name
        instance.display = instance.name + ' (' + id + ')';
      }
      else if(
        ('parameters' in instance) &&
        Object.keys(instance.parameters).some(isAutoScaleGroup)
      ) {
        // AutoScalingGroup pretty dipslay name
        instance.display =
          instance.server.split('/').pop() +
          ' (' + site.instances.types.autoscale + ')';
      }
      else {
        instance.display = id;
      }
      return instance;
    },

    /**
     *
     */
    parseLocation: function(instance) {
      if(! instance.location) {
        instance.location = this.collection.site.name;
        instance.namespace = this.collection.site.namespaces.grok.custom;
      }
      return instance;
    },

    /**
     *
     */
    parseStatusName: function(instance) {
      Object.keys(this.CONST.STATUS).forEach(function(status) {
        if(instance.status & this.CONST.STATUS[status].CODE) {
          instance.statusName = this.CONST.STATUS[status].NAME;
        }
      }.bind(this));

      return instance;
    },

    /**
     *
     */
    parseStatusMessage: function(instance) {
      // strip errors of tags
      if(instance.message && instance.message.match(/<.*?>/)) {
        instance.message = instance.message.replace(/<.*?>/g, '');
      }
      return instance;
    }

  });

}());

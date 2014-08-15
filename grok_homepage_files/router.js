/*
 * ----------------------------------------------------------------------
 *  Copyright (C) 2006-2012 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

/*
 * START HERE!! See the GROKUI.Router definition below.
 */

(function() {

    var initializer,
        routerExtension;

    initializer = function() {
        GROKUI.loader = this.loader = new GROKUI.Loader({
            namespace: GROKUI,
            cachePostfix: ['v', GROKUI.product.version].join('='),
            dependencies: GROKUI.Router.prototype.deps,
            contentPaneId: 'content'
        });
        // allows users to provide their own initialize functions
        if (this.initializer) {
            this.initializer.apply(this, arguments);
        }
    };

    // creating the object to extend the Backbone router, and allowing the
    // application to provide its own details through GROKUI.routes.
    routerExtension = {
        routes: GROKUI.routes.urls,
        deps: GROKUI.routes.deps,
        initialize: initializer
    };
    // mixing in the handler functions
    Object.keys(GROKUI.routes.handlers).forEach(function(handlerName) {
        routerExtension[handlerName] = GROKUI.routes.handlers[handlerName];
    });
    // also add the initializer at the same level as the handlers
    routerExtension.initializer = GROKUI.routes.initialize;

    /**
     * This router is the starting point for the GROK SITE!
     */
    GROKUI.Router = Backbone.Router.extend(routerExtension);

})();

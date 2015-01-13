var Boom = require('boom');
var Joi = require('joi');
var _ = require('underscore');


/*** RESOURCE CONFIGURATION ***/

var resourceName = "Resource";
var resourcePath = "/resource";
var resourceOptions = {};

// model schema for this route (without the id property)
var baseModelSchema = Joi.object().keys({
    firstName: Joi.string().required()
});

// schema for the id property
var idSchema = Joi.number().integer().min(1);

/*** END OF RESOURCE CONFIGURATION ***/



function validateIds(value, options, next){
debugger;
    value.ids = value.ids.split(",");

    var schema = Joi.object().keys({
        ids: Joi.array().unique().includes(idSchema)
    });

    var validation = Joi.validate(value, schema);

    if(validation.error){  return next(validation.error);  }

    return next(undefined, validation.value);
};


function validatePayload(value, options, next){
debugger;
    if(_.isObject(value) && !_.isArray(value)){  value = [value];  }


    // id param is now an array of integers
    var ids = options.context.params.ids;

    var modelSchema;
    if(ids){  // this is the PUT route; add the id key to the base model schema;
    	modelSchema = baseModelSchema.keys({
    		id: idSchema.required()
    	});
    } 
    else{  // this is the POST route; use the base model schema;
    	modelSchema = baseModelSchema;
    }

    var payloadSchema = Joi.array().includes(modelSchema);

    var validation = Joi.validate(value, payloadSchema);

    if(validation.error){  return next(validation.error); }

    
    if(ids){  // this is the PUT route
	    for(var i=0, l=validation.value.length; i<l; i++){
	        if(!_.contains(ids, validation.value[i].id)){
	            return next(Boom.conflict("The ids given in the payload and in the URI must match."));
	        }
	    }
	}

    return next(undefined, validation.value);
};

var resourceDefinition = function(server, options, next) {

	// READ (all)
    server.route({
        method: 'GET',
        path: resourcePath,
        handler: function (request, reply) {
        	var output =  Boom.notImplemented("Sorry, not yet implemented.");  // 501
            reply(output);
        },
        config: {
			description: 'Get all the resources',
			notes: 'Returns all the resources (full collection)',
			tags: ['api'],
        }
    });

	// READ (one or more, but not all)
    server.route({
        method: 'GET',
        path: resourcePath + "/{ids}",
        handler: function (request, reply) {
debugger;
        	var output =  Boom.notImplemented("Sorry, not yet implemented.");  // 501
            reply(output);
        },
        config: {
			validate: {
	            params: validateIds,
			},

			description: 'Get 2 (short description)',
			notes: 'Get 2 (long description)',
			tags: ['api']
        }
    });

    // CREATE (one or more)
    server.route({
        method: 'POST',
        path: resourcePath,
        handler: function (request, reply) {
        	var output =  Boom.notImplemented("Sorry, not yet implemented.");  // 501
            reply(output);
        },
        config: {
        	validate: {
        		payload: validatePayload
        	},

			description: 'Post (short description)',
			notes: 'Post (long description)',
			tags: ['api'],
        }
    });

    // UPDATE (one or more)
    server.route({
        method: 'PUT',
        path: resourcePath + "/{ids}",
        handler: function (request, reply) {
debugger;
        	var output =  Boom.notImplemented("Sorry, not yet implemented.");  // 501
            reply(output);
        },
        config: {
			validate: {
	            params: validateIds,
        		payload: validatePayload
			},

			description: 'Put (short description)',
			notes: 'Put (long description)',
			tags: ['api'],
        }
    });

    // DELETE (one or more)
    server.route({
        method: 'DELETE',
        path: resourcePath + "/{ids}",
        handler: function (request, reply) {
        	var output =  Boom.notImplemented("Sorry, not yet implemented.");  // 501
            reply(output);
        },
        config: {
			validate: {
	            params: validateIds,
			},

			description: 'Delete (short description)',
			notes: 'Delete (long description)',
			tags: ['api'],
        }
    });

    // any other request will receive a 405 Error
    server.route({
        method: '*',
        path: resourcePath + "/{p*}",
        handler: function (request, reply) {
        	var output = Boom.methodNotAllowed('The method is not allowed for the given URI.');  // 405
            reply(output);
        }
    });

    next();
};

resourceDefinition.attributes = {
    name: resourceName,
    version: '1.0.0'
};

exports.options = resourceOptions;
exports.register = resourceDefinition;

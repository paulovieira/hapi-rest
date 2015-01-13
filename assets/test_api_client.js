

/*
Collection.prototype.save is based on Model.prototype.save. This method has a bit of complexity to handle
cases like this:

	myModel.save("name", "paulo", {option1: value1})

that is, update (or set) the attribute "paulo" and save immediately. Multiple attributes can also be updated/set
before the save:

	myModel.save({"name": "paulo", "email": "...@..."}, {option1: value1})

The collection's version won't allow this, so it will be simpler. It can used only as

	myCollection.save({opton1: value1})

*/


Backbone.Collection.prototype.save = function(options) {
debugger;
      var promises = [], newModels = [], newModelsAttrs = [], changedModels = [], changedModelsAttrs = [];
      options = options || {};

      this.each(function(model){
      	if(model.isNew()){ 
      		newModels.push(model);
      		newModelsAttrs.push(model.toJSON());
      	}
      	else if(model.hasChanged()){  
      		changedModels.push(model);
      		changedModelsAttrs.push(model.toJSON());
      	}
      });

      // After a successful server-side save, the collection will be
      // updated with the server-side state (using .set())
      if (options.parse === void 0) options.parse = true;
      if (options.remove === void 0) options.remove = false;

      var optionsNew     = _.clone(options) || {};
      var optionsChanged = _.clone(options) || {};

      optionsNew.url     = this.url;
      optionsChanged.url = this.url + "/" + _.pluck(changedModelsAttrs, "id").join(",");

      var collection = this;

      // make sure the promises array always has 2 promises (even if one of them is a "dummy promise")

      promises.push(newModels.length > 0 ?
					this.sync("create", this, _.extend(optionsNew, {attrs: newModelsAttrs})) : 
					Q(undefined));

      promises.push(changedModels.length > 0 ?
					this.sync("update", this, _.extend(optionsChanged, {attrs: changedModelsAttrs})) :
					Q(undefined));


      // TODO: is there are no new or changed models, what should we do? return a fulfilled promise? or return false?

      var promise = Q.all(promises)
      				.then(
      					function(resp){
      						debugger;

      						// NOTE: if there are no new models, the corresponding promise in the "promises"
      						// array will already be resolved (with undefined)

      						// the first entry in the resp array is the fulfillment value of the promise
      						// relative to the new models
							if(resp[0]){

								// we have to update the models' attributes directly (instead of using collection's 
								// set); otherwise we end up having duplicate models in the collection (because the
								// models that are currently present don't have yet an id, so the set() method
								// will create new ones)
      							var model;
								for(var i=0, l=resp[0].length; i<l; i++){
									model = newModels[i];
									model.set(model.parse(resp[0][i]), options);
								}

						        if (options.success){ options.success(collection, resp[0], options); }
						        collection.trigger('sync', collection, resp[0], options);
							}

      						// the second entry is the fulfillment value relative to the existing models 
      						// (models that have been updated); here we can use collection's set()
							if(resp[1]){
								collection.set(resp[1], options);

						        if (options.success){ options.success(collection, resp[1], options); }
						        collection.trigger('sync', collection, resp[1], options);
							}
      					},
      					function(err){
      						debugger;
						    if (options.error) options.error(collection, resp, options);
						    collection.trigger('error', collection, resp, options);
      					}
      				)

		return promise;
    };






var User = Backbone.Model.extend({
	defaults: {
		first: "",
		last: "",
		email: ""
	},

	parse: function(resp, options){
		debugger;
		if(_.isArray(resp)){  resp = resp[0];  }

        resp.first = resp.first || "";
        resp.last  = resp.last || "";
        resp.email = resp.email || "";

        return resp;
	}
});

var Users = Backbone.Collection.extend({
	model: User,
	url: "/api/users",
});

var usersC = new Users();

// callback to be used as the success handler 
var saveModelCb = function(entity, resp){
	debugger;
	if(entity instanceof Backbone.Model){
		entity.unset("pw_hash");
	}
	else if(entity instanceof Backbone.Collection){
		entity.each(function(model){
			model.unset("pw_hash");	
		});
	}
}

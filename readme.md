# hapi-rest-mockup

## Introduction

This is a mockup of a RESTful API. It is built with HapiJS (v7.5). The objective is to quickly try Hapi to build an API, namely the capabilities for authorization, validation and code organization.

The API provides data relative to countries. The format of the URI is:

    /api/countries/{country_code}

where country_code is a 3-digit code defined in ISO 3166-1 (an integer):

For more details see: http://en.wikipedia.org/wiki/ISO_3166-1_numeric

Example: 

    GET /api/countries/620

would retrieve data relative to Portugal.

If a country is fixed, the API also provides informations relative to the cities of the country (a many-to-1 relation). The format is:

    /api/countries/{country_code}/cities/{city}

Example:

If we fix Portugal, we can obtain data about its cities:

    GET /api/countries/620/cities/lisbon
    GET /api/countries/620/cities/braga

would retrieve data relative to Lisbon and Braga (a city in the north of Portugal).





# GET /api/countries  (get all the countries)

- will retrieve the resource identified by /api/countries (which is the complete collection of countries)
- internally we are doing "SELECT * FROM table"
- there is no parameter in the path (a request like GET /api/countries/10 will be handled by the other GET route)
- there is no payload (if present, will be ignored)

## validation of the ids parameter

does not apply (there is nothing to validate)

NOTE: if an ids param is given, the request will be handled by the other GET route


## validation of the payload

does not apply (if payload is present, will be ignored)


## data available for the handler (processed)

none

## body response

the complete list of countries resources (as an array of objects)




# GET /api/countries/{ids}   (get the countries identified in the ids)

- will retrieve the resources identified by the ids param: 
    - GET /api/countries/10
    - GET /api/countries/10,12
- internally we are doing "SELECT * FROM table WHERE id IN (id1, id2, ...)"
- the ids param IS required (a request like GET /api/countries will be handled by the above GET route)
- multiple ids can be given: GET /api/countries/10,13,15
- there is no payload (if present, will be ignored)

## validation of the ids parameter

NOTE: if not given, the request will be handled by the above route;

- trim the parameter to handle cases like this: GET /api/countries/10,13,15,
- split the string into an array, using comma as the separator
- use joi to verify that all the elements of the array are valid. For instance:
    - array of integers
    - array of alpha-numerics
    - array of value having a pre-defined format
    - etc
- update the param value (so that the route handler will have request.param.id as an array with elements of the correct type)

## validation of the payload

does not apply (if payload is present, will be ignored)


## data available for the handler (processed)

request.params.id: an array with the requested ids; the elements of the array will have the correct type;

## body response

An array of objects relative to the countries identified by the ids param; even if only 1 country was requested, the response will be array (having 1 element). This means that we have to override the .parse() method in Backbone.Model




# GET /api/countries/:key1=value1&key2=value2  (get the countries which satisfy the conditions given in the pseudo-query string)


Instead of using the usual query string:

    /api/countries/?key1=value1&key2=value2

we use 

    /api/countries/:key1=value1&key2=value2

(that is, a colon instead of a question mark). This format provides more flexibility because we get the key/values as a URL param instead of as a query string. We can do everything that a query string does (with a format that is almost the same), plus much more. 

For instance:

    GET /api/countries/:key1=value1&key2=value2  (this is like using a query string)

    GET /api/countries/10,12:key1=value1&key2=value2

    GET /api/countries/:key1=value1/cities/lisbon

    GET /api/countries/:key1=value1/cities/lisbon:key2=value2

    GET /api/users/:username=paulovieira@gmail.com&password=abc

# POST /api/countries

- will create a new resource
- there is NO parameter in the path
- the payload is required (json)
    + either an object with a pre-defined schema
    + or an array of objects with that schema
    

## validation of the ids parameter

does not apply (a request like POST /api/countries/10 will automatically receive a 404 error, because there is no defined POST route accepting parameters)

## validation of the payload

- first: if the payload is an object and not an array, place the object into an array
- define the schema using Joi:
    + should be an array of objects
    + should NOT have the id property
    + define the keys of the other properties + the type + required (optional)
- validate
- update the value

## data available for the handler (processed)

request.payload: an array of objects; the data in each attribute is already converted to the type described in the Joi schema

## body response

...


# PUT /api/countries/{ids}

- will update the resources identified by the ids param
- the ids param IS required
- multiple ids can be given (similar to the 2nd GET route): PUT /api/countries/10,13,15
- the payload is required (similar to POST, but here we also require the id parameter in the schema):
    + either an object with a pre-defined schema
    + or an array of objects with that schema


## validation of the ids parameter

exactly like was done for the 2nd GET route

NOTE: a request like PUT /api/countries will automatically receive a 404 error, because there is no defined PUT route with that path; the param in this route is required (by definition, since there is no "?" at the end)


## validation of the payload 

Exactly like was done for POST case, but here we require the id property in the schema of the object. We can use the inheritance provided by Joi. 

Besides that, were we have one extra step:

- verify the consistency between the ids given in the ids param and the ids in the payload

NOTE: the method used in PUT and POST should be common. The small diferences can be treated using a coupe if/else

## data available for the handler (processed)

    - request.params.id: an array with the requested ids (will have 1 or more elements)
    - request.payload: an array of objects; the data in each attribute is already converted to the type described in the Joi schema; the id attribute in the objects is consistent with the ids param

## body response

...


# DELETE /api/countries/{ids}

- will delete the resources identified by the ids param
- the ids param IS required (like in PUT)
- multiple ids can be passed (similar to GET and PUT)
    - DELETE /api/countries/10
    - DELETE /api/countries/10,13,15
- there is no payload (if present, will be ignored)

## validation of the ids parameter

exactly like was done for the 2nd GET and PUT routes

NOTE: a request like DELETE /api/countries will automatically receive a 404 error, because there is no defined PUT route with that path; the param in this route is required (by definition, since there is no "?" at the end)


## validation of the payload 

does not apply (if payload is present, will be ignored)

## data available for the handler (processed)

- request.params.id: an array with the requested ids; if no id was requested it will be an empty array

## body response




# CONCLUSION

## Validation of the ids param

The validation of the ids param is the same for 
    - GET (some)
    - PUT 
    - DELETE

The remaining routes don't have a param
    - GET (all)
    - POST


## Validation of the payload

The validation of the payload is similar for 
    - PUT
    - POST

The remaining routes will ignore the payload
    - GET (all)
    - GET (some)
    - DELETE

The differences between PUT and POST are
    - in PUT the schema should have the id property while POST should not have the id property.
    - in PUT we must check the consistency between the ids param and the id property in the payload, while in POST we don't have (because there is no ids param)


# TODO
    -see how the authentication can affect the actions
        - some data can be read only by users of a certain group
        - some data can be read/updated only a specific user (for instance, change the email or reset the password)
    -see if the MrHorse plugin can help with this


    -place the code to see it as the trajectory of a pinball (during the lifecycle of a request)


create new data in the database (POST)
- client sends the payload
- the payload is validated by joi
- when we arrive to the handler, we already have an array of objects that can be safely stored in the db (there's no need to make a second validation at the db level, which will simplify the sql code)
- we create a backbone collection from the payload (array of objects)
- we call save()
    + receive a promise
    + when the promise fulfills we get an array of the newly created rows (objects) in the database; this data will the id property (+ some other eventual default values)
    + update the models
    + call reply(collection.toJSON()) 




curl -X PUT -H "Content-Type: application/json" -d '[{"id": 84, "first": "xxx", "pw_hash": "www"}]'
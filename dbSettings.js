module.exports = {

    postgres: {
        host: "127.0.0.1",
        database: "test_150107",
        username: "clima",
        password: "clima"
    },

    getConnectionString: function(db){
        var connectionString;
        switch(db){
            case "pg":
            case "postgres":
                connectionString = "postgres://" 
                                    + this.postgres.username + ":" 
                                    + this.postgres.password + "@" 
                                    + this.postgres.host + "/" 
                                    + this.postgres.database;
                break;
        }

        return connectionString;
    }
}

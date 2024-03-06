class User{
    constructor(id,email,password, poi_visited){
        this.id = id; 
        this.email = email; 
        this.password = password;
        this.poi_visited = poi_visited
    }
}

module.exports = User;
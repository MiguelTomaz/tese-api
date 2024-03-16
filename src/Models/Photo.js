class Photo {
    constructor(id, tourist_route_association_id, description, date, image_hash, filename, image_base64) {
      this.id = id;
      this.tourist_route_association_id = tourist_route_association_id;
      this.description = description;
      this.date = date;
      this.image_hash = image_hash;
      this.filename = filename;
      this.image_base64 = image_base64;
    }
  }
  
  module.exports = Photo;
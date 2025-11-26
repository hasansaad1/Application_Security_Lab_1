// Entities
class Listing {
  constructor({ id, owner_id, title, description, price, address_country, address_province, address_city, address_zip_code, address_line1, address_line2, is_available, publication_date }) {
    this.id = id;
    this.owner_id = owner_id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.address_country = address_country;
    this.address_province = address_province;
    this.address_city = address_city;
    this.address_zip_code = address_zip_code;
    this.address_line1 = address_line1;
    this.address_line2 = address_line2;
    this.is_available = is_available;
    this.publication_date = publication_date || new Date();
  }
}


module.exports = { Listing };
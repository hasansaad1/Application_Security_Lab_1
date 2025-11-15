class User {
  constructor({ id, username, email, password_hash, role, profile_picture_path, phone_number }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password_hash = password_hash;
    this.role = role;
    this.profile_picture_path = profile_picture_path;
    this.phone_number = phone_number;
  }

  toJSON() {
    return {
      id                    : this.id,
      username              : this.username,
      email                 : this.email,
      phone_number          : this.phone_number,
      profile_picture_path  : this.profile_picture_path
    };
  }
}

module.exports = { User };
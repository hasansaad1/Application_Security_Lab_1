/**
 * Asserts that the current user is the owner of a resource.
 * Throws an error if the user is not the owner.
 * 
 * @param {number} resourceOwnerId - The ID of the resource owner
 * @param {number} currentUserId - The ID of the current user
 * @param {string} [resourceType="resource"] - Optional resource type for error message (e.g., "listing", "user")
 * @throws {Error} Throws an error if ownership check fails
 */
function assertOwner(resourceOwnerId, currentUserId, resourceType = "resource") {
  if (resourceOwnerId !== currentUserId) {
    throw new Error(`Forbidden: You are not the owner of this ${resourceType}`);
  }
}

module.exports = {
  assertOwner
};


/**
 * Asserts that the current user is the owner of a resource.
 * Throws an error if the user is not the owner.
 * 
 * @param {number|string} resourceOwnerId - The ID of the resource owner
 * @param {number|string} currentUserId - The ID of the current user
 * @param {string} [resourceType="resource"] - Optional resource type for error message (e.g., "listing", "user")
 * @throws {Error} Throws an error if ownership check fails
 */
function assertOwner(resourceOwnerId, currentUserId, resourceType = "resource") {
  // Convert both to numbers for comparison (handles string/number mismatch)
  const ownerId = Number(resourceOwnerId);
  const userId = Number(currentUserId);
  
  if (isNaN(ownerId) || isNaN(userId)) {
    throw new Error(`Invalid user ID or resource owner ID`);
  }
  
  if (ownerId !== userId) {
    throw new Error(`Forbidden: You are not the owner of this ${resourceType}`);
  }
}

module.exports = {
  assertOwner
};


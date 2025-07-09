import { NotFoundException, type WorkOS } from '@workos-inc/node';

/**
 * Checks if a user exists in WorkOS by their ID.
 *
 * @param workosId - The unique identifier of the user in WorkOS
 * @param workos - The WorkOS client instance used to make API calls
 * @returns A promise that resolves to true if the user exists, false if not found
 * @throws Will throw an error if the API call fails for reasons other than user not found
 *
 * @example
 * ```typescript
 * const userExists = await doesUserExistInWorkOS('user_123', workosClient);
 * if (userExists) {
 *   console.log('User found in WorkOS');
 * }
 * ```
 */
export async function doesUserExistInWorkOS(workosId: string, workos: WorkOS) {
  let doesUserExist = false;
  try {
    //We only call the api to check if there is a user, we discard the data
    await workos.userManagement.getUser(workosId);
    doesUserExist = true;
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      // User is not Found so it is already deleted in workos
      doesUserExist = false;
    } else {
      throw error;
    }
  }
  return doesUserExist;
}

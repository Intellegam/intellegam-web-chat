import { NotFoundException, type WorkOS } from '@workos-inc/node';

export async function doesUserExistInWorkOS(workosId: string, workos: WorkOS) {
  let doesUserExist = false;
  try {
    //we just call the api to check if there is a user
    // if not then it was deleted and the user.created webhook came after that event
    await workos.userManagement.getUser(workosId);
    doesUserExist = true;
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      //UserNotFoundException so we dont create the user in our DB because it was already deleted
      doesUserExist = false;
    }
  }
  return doesUserExist;
}

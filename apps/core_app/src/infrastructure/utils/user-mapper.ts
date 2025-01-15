import { PublicUserProfileDto } from "@app/shared-dto/dtos/user/public-profile-user.dto";
import { UserViewModel } from "@core_app/src/domain/interfaces/view_models/UserViewModel";


export function mapToPublicUserProfileDto(user: Partial<UserViewModel>): PublicUserProfileDto {
  if (!user.id || !user.email || !user.username) {
    throw new Error('Missing required fields for mapping to PublicUserProfileDto');
  }

  return new PublicUserProfileDto(
    user.id, 
    user.email, 
    user.username, 
    user.firstName, 
    user.lastName, 
    user.city, 
    user.country, 
    user.dateOfBirthday);
}

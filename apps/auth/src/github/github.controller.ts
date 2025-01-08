import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/github')
export class GithubAuthController {
  @Get()
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Redirect to GitHub login page
  }

  @Get('callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req) {
    // req.user содержит данные пользователя, полученные из validate
    return {
      message: 'GitHub authentication successful',
      user: req.user,
    };
  }
}

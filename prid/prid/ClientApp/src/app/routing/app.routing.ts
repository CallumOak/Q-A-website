import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { UserListComponent } from '../components/userlist/userlist.component';
import { LoginComponent } from '../components/login/login.component';
import { SignupComponent } from '../components/signup/signup.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/user';
import { TagListComponent } from '../components/taglist/taglist.component';
import { NewQuestionComponent } from '../components/new-question/new-question.component'
import { QuestionComponent } from '../components/question/question.component'
import { QuestionsListComponent } from '../components/questionlist/questionlist.component';
const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: 'tags',
    component: TagListComponent
  },
  {
    path: 'questions',
    component: QuestionsListComponent
  },
  {
    path: 'questions/:id',
    component: QuestionsListComponent
  },
  {
    path: 'new',
    component: NewQuestionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'question/:id',
    component: QuestionComponent
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'restricted', component: RestrictedComponent },
  { path: '**', component: UnknownComponent }
];
export const AppRoutes = RouterModule.forRoot(appRoutes);
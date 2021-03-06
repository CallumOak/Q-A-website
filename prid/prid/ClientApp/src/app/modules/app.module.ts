import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutes } from '../routing/app.routing';
import { AppComponent } from '../components/app/app.component';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { NavMenuComponent } from '../components/nav-menu/nav-menu.component';
import { HomeComponent } from '../components/home/home.component';
import { LoginComponent } from '../components/login/login.component';
import { UserListComponent } from '../components/userlist/userlist.component';
import { TagListComponent } from '../components/taglist/taglist.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { SharedModule } from './shared.module';
import { EditUserComponent } from '../components/edit-user/edit-user.component';
import { EditTagComponent } from '../components/edit-tag/edit-tag.component';
import { SignupComponent } from '../components/signup/signup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetFocusDirective } from '../directives/setfocus.directive';
import { NewQuestionComponent } from '../components/new-question/new-question.component';
import { MarkdownModule } from 'ngx-markdown';
import { SimplemdeModule } from 'ngx-simplemde';
import { QuestionComponent } from '../components/question/question.component';
import { QuestionsListComponent } from '../components/questionlist/questionlist.component';
import { FilterTemplateComponent } from '../components/filter-template/filter-template.component';
import { MatMenuModule, MatSortModule, MatMenuTrigger, MatTableModule, MatSelectModule } from '@angular/material';
import { PostComponent } from '../components/post/post.component';
import { CommentsComponent } from '../components/comments/comments.component';
import { CommentComponent } from '../components/comment/comment.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    LoginComponent,
    UserListComponent,
    TagListComponent,
    UnknownComponent,
    RestrictedComponent,
    SetFocusDirective,
    EditUserComponent,
    EditTagComponent,
    SignupComponent,
    NewQuestionComponent,
    QuestionComponent,
    QuestionsListComponent,
    FilterTemplateComponent,
    PostComponent,
    CommentComponent,
    CommentsComponent
  ],
  entryComponents: [EditUserComponent, EditTagComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutes,
    BrowserAnimationsModule,
    SharedModule,
    MarkdownModule.forRoot(),
    SimplemdeModule.forRoot({
      options: { autosave: { enabled: true, uniqueId: 'MyUniqueID' } }
    }),
    MatMenuModule,
    MatSortModule,
    MatButtonToggleModule,
    MatTableModule,
    MatSelectModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
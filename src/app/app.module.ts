import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { CallbackComponent } from './login/callback/callback.component';
import { ErrorPageComponent } from './login/error-page/error-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainPageComponent } from './main-page/main-page.component';
import { SpotifyService } from './core/services/spotify.service';
import { GlobalHttpInterceptor } from './core/security/global-http-interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MatSelectModule } from '@angular/material/select';
import { ResultPageComponent } from './result-page/result-page.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogCreatePlaylistComponent } from './core/dialogs/dialog-create-playlist/dialog-create-playlist.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogDeletePlaylistComponent } from './core/dialogs/dialog-delete-playlist/dialog-delete-playlist.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CallbackYoutubeComponent } from './login/callback-youtube/callback-youtube.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PlaylistResultPageComponent } from './result-page/playlist-result-page/playlist-result-page/playlist-result-page.component';
import { DialogModifyPlaylistComponent } from './core/dialogs/dialog-modify-playlist/dialog-modify-playlist.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CallbackComponent,
    ErrorPageComponent,
    MainPageComponent,
    NavBarComponent,
    SearchBarComponent,
    ResultPageComponent,
    DialogCreatePlaylistComponent,
    DialogDeletePlaylistComponent,
    CallbackYoutubeComponent,
    PlaylistResultPageComponent,
    DialogModifyPlaylistComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSelectModule,
    MatMenuModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: GlobalHttpInterceptor,
    multi: true,
  }, SpotifyService],
  bootstrap: [AppComponent]
})
export class AppModule { }

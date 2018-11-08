import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeuerungsrechnerPageComponent } from '@teuerungsrechner/page/teuerungsrechner.page';

const routes: Routes = [{
    component: TeuerungsrechnerPageComponent,
    path: ''
}];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}

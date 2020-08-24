// outer imports
import { NgModule } from '@angular/core';
// inner imports
import { SharedMaterialModule } from '@common/shared-material.module';
import { SharedOtherModule } from '@common/shared-other.module';
//
import { ConfirmDialogComponent } from './confirm-dialog.component';
// imports end

@NgModule({
  imports: [SharedOtherModule, SharedMaterialModule],
  declarations: [ConfirmDialogComponent]
})
export class ConfirmDialogModule {}

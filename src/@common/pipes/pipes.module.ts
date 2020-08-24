import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//
import { CommonKeysPipe } from './keys.pipe';
import { CommonFilterPipe } from './filter.pipe';
import { SafeHtmlPipe } from './safeHtml.pipe';
import { SafeDecimalPipe } from '@common/pipes/safeDecimal.pipe';

const PIPES = [CommonKeysPipe, CommonFilterPipe, SafeHtmlPipe, SafeDecimalPipe];

@NgModule({
  imports: [CommonModule],
  declarations: [...PIPES],
  exports: [...PIPES]
})
export class CommonPipesModule {}

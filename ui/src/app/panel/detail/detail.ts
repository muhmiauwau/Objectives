import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from 'services/panel.service';

@Component({
  selector: 'panel-detail',
  standalone: true,
  templateUrl: './detail.html',
  styleUrl: './detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDetail {
  private panel = inject(PanelService);
  viewHeadline = "List";

  // derived signals for template
  selectedPerson = this.panel.selectedPerson;
  view = this.panel.view;

  close() {
    this.panel.openList();
  }
}

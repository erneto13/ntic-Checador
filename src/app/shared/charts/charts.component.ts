import { Component } from '@angular/core';
import { HighchartsChartModule } from "highcharts-angular"
import Highcharts from "highcharts";

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './charts.component.html',
})
export class ChartsComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'micola',
    },
    series: [
      {
        type: 'bar',
        data: [1, 2, 3],
      },
    ],
  };
}

import { Component, AfterViewInit, ChangeDetectorRef, OnInit, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit, AfterViewInit {
  isUserView: boolean = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isUserView = event.url.includes('/staff/order') || event.url.includes('/admin/category');           
        if (!this.isUserView) {
          setTimeout(() => {
            this.renderCharts();
            this.cdr.detectChanges(); // Cập nhật lại giao diện          
          }, 100);
        }
      }
    });
  }
  
  ngAfterViewInit(): void {
    if (!this.isUserView) {
      this.renderCharts();
    }
  }

  renderCharts() {
    this.renderBarChart();
    this.renderLineChart();
    this.renderPaymentChart();
    this.renderGroupedBarChart();
    this.renderDoughnutChart();
    this.renderPieChart();
  }

  reloadPage() {
      this.cdr.detectChanges();
  }

  logout(): void {
    localStorage.clear();
    this.cdr.detectChanges();
    alert('Bạn đã đăng xuất thành công!');
    this.router.navigate(['/login']);
  }


  renderBarChart(): void {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar', // Loại biểu đồ
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
          label: 'Sales (in USD)',
          data: [120, 190, 300, 500, 250, 350, 420],
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 2,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#131417'
            }
          },
          tooltip: {
            backgroundColor: '#f85757',
            titleColor: '#fff',
            bodyColor: '#fff',
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#131417'
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#131417'
            },
            grid: {
              color: 'rgba(200, 220, 248, 0.5)',
              
            }
          }
        }
      }
    });
  }

  renderLineChart(): void {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'line', // Loại biểu đồ line
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: 'Revenue (in USD)',
          data: [300, 400, 500, 600, 700, 800, 900],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#131417'
            }
          },
          tooltip: {
            backgroundColor: '#f85757',
            titleColor: '#fff',
            bodyColor: '#fff',
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#131417'
            },
            grid: {
              color: 'rgba(200, 220, 248, 0.5)',
             
            }
          },
          y: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#131417'
            },
            grid: {
              color: 'rgba(200, 220, 248, 0.5)',
             
            }
          }
        }
      }
    });
  }

  renderGroupedBarChart(): void {
    const ctx = document.getElementById('groupedBarChart') as HTMLCanvasElement;

    new Chart(ctx, {
        type: 'bar', // Biểu đồ cột
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
                {
                    label: 'Online Sales',
                    data: [100, 200, 150, 300, 250, 400],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Offline Sales',
                    data: [120, 180, 170, 280, 300, 350],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        color: '#131417'
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    ticks: { font: { size: 12 }, color: '#131417' }
                },
                y: {
                    stacked: false,
                    ticks: { font: { size: 12 }, color: '#131417' }
                }
            }
        }
    });
}

renderDoughnutChart(): void {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;

    new Chart(ctx, {
        type: 'doughnut', // Biểu đồ Doughnut
        data: {
            labels: ['Online', 'Offline'],
            datasets: [
                {
                    label: 'Sales Distribution',
                    data: [60, 40],
                    backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        color: '#131417'
                    }
                }
            }
        }
    });
}

renderPieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;

    new Chart(ctx, {
        type: 'pie', // Biểu đồ Pie
        data: {
            labels: ['Product A', 'Product B', 'Product C'],
            datasets: [
                {
                    label: 'Product Sales',
                    data: [300, 200, 100],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        color: '#131417'
                    }
                }
            }
        }
    });
}


  renderPaymentChart(): void {
    const ctx = document.getElementById('paymentChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'line', // Loại biểu đồ line
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Online Payments (in USD)',
            data: [100, 480, 400, 150, 350, 200, 500],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Offline Payments (in USD)',
            data: [170, 220, 120, 450, 100, 250, 550],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            borderWidth: 2,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#131417'
            }
          },
          tooltip: {
            backgroundColor: '#f85757',
            titleColor: '#fff',
            bodyColor: '#fff',
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#131417'
            },
            grid: {
              color: 'rgba(200, 220, 248, 0.5)',
           
            }
          },
          y: {
            ticks: {
              font: {
                size: 12,
              },
              color: '#131417'
            },
            grid: {
              color: 'rgba(200, 220, 248, 0.5)',
  
            }
          }
        }
      }
    });
  }
}
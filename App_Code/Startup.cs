using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(genericAjaxDataTableD3groupedBarChart.Startup))]
namespace genericAjaxDataTableD3groupedBarChart
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}

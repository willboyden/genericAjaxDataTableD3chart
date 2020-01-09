# genericAjaxDataTableD3chart
generic template for web service taking client input and returning JSON for DataTable linked to D3 chart.

The main focus of this template is reusability. Various pieces can be directly plugged into other projects or used as a starting point.
With a clear seperation of client and server data proccessing, we can heavier proccessing on the client or server based on use case.

#BackEnd
The backend is a C# asmx webservice that takes takes string parameters and returns json(can return xml with minor modification).
To aviod sql injections rather than directly put the clients string in our query or rely on a library to safely encide the string. 
We dynammically create the queriery serverside. Serverside defined strings are added to the query if they are contained in the 
styring parameter sent from client. This example uses C# and mySql but swamping these for other languages should be relativly painless.


#FrontEnd 
-d3v5 grouped barchart
--includes example of dynamically resizing d3 chart (still neeeds fine tuning, looking more into viewport)
--transition animation
--allwowing for chart to be drawn based on gerneic xvals, keys(aka yvals), array, and d3 selected svg

-DataTables.Net created dynamically based on string of column names
--this includes creating a properly formatted empty html table with proper headers and footers
--creating column json variable for datatables api
--creating individual colomn filters based on data
--function parameter to run when data in table changes

#Comming soon
-Allow for different data source types like json, csv, word so users can explore what ever data they want

-Allow input of URL to scrape html table on that page for data source

-fine tune css for resize events

-try to make moble node js app from project







using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using MySql.Data.MySqlClient;

/// <summary>
/// Summary description for dataService
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class dataService : System.Web.Services.WebService
{
    public dataService()
    {
        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    private string constr = ConfigurationManager.ConnectionStrings["mysqlYoutubeData"].ConnectionString;

    //public string Type
    //{
    //    get { return _type; }
    //}


    /// <summary>
    /// we do not want to build a query directly from client side input
    /// so instead we will check if the input contained anything we may want to add to our query
    /// if that is the case then we add server defined data(like column names) to our querry
    /// </summary>
    /// <param name="cols"></param>
    /// <returns></returns>
    public string getSecureJsonColumns(string cols, string safeTblString)
    {
        //first get the availible columns in our table
        DataTable schema = null;
        using (var con = new MySqlConnection(constr))
        {
            using (var schemaCommand = new MySql.Data.MySqlClient.MySqlCommand("SELECT * FROM " + safeTblString + " LIMIT 0", con))
            {
                con.Open();
                using (var reader = schemaCommand.ExecuteReader(CommandBehavior.SchemaOnly))
                {
                    schema = reader.GetSchemaTable();
                }
            }
        }
        StringBuilder sbsql = new StringBuilder();
        foreach (DataRow col in schema.Rows)//not directly from client side input 
        {
            string colName = col.Field<String>("ColumnName");
            if (cols.Contains(colName))//the column name is contained in client side string
            {
                sbsql.Append("'" + colName + "', " + colName + ", ");//add column name in json query format
            }
        }
        sbsql.Remove(sbsql.Length - 2, 1); //remove last whitespace and comma
        sbsql.Append(") ");
        string sqlstring = sbsql.ToString();
        return sqlstring;
    }

    public string getSecureColumns(string cols, string safeTblString)
    {
        //first get the availible columns in our table
        DataTable schema = null;
        using (var con = new MySqlConnection(constr))
        {
            using (var schemaCommand = new MySql.Data.MySqlClient.MySqlCommand("SELECT * FROM " + safeTblString + " LIMIT 0", con))
            {
                con.Open();
                using (var reader = schemaCommand.ExecuteReader(CommandBehavior.SchemaOnly))
                {
                    schema = reader.GetSchemaTable();
                }
            }
        }
        StringBuilder sbsql = new StringBuilder();
        foreach (DataRow col in schema.Rows)//not directly from client side input 
        {
            string colName = col.Field<String>("ColumnName");
            if (cols.Contains(colName))//the column name is contained in client side string
            {
                sbsql.Append("" + colName + ", ");//add column name in json query format
            }
        }
        sbsql.Remove(sbsql.Length - 2, 1); //remove last whitespace and comma
        sbsql.Append(") ");
        string sqlstring = sbsql.ToString();
        return sqlstring;
    }

    public string getSecureTable(string table)
    {
        //first get the availible tables
        string safeTblString = "usvideowithcategory";//incase none our found default set a default//TODO: catch none being found properly
        using (var con = new MySqlConnection(constr))
        {
            using (var schemaCommand = new MySql.Data.MySqlClient.MySqlCommand("show tables", con))
            {
                con.Open();
                using (var reader = schemaCommand.ExecuteReader(CommandBehavior.SchemaOnly))
                {
                    if (reader.Read())
                    {
                        safeTblString = reader.GetString(0);
                        if (table.Contains("safeTblString"))
                        {
                            return safeTblString;//return the a table in our DB rather than string sent from client
                        }
                    }

                }
            }
        }
        return safeTblString;
    }

    [WebMethod]
    [ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
    public void getData(string cols, string table)
    {
        var safeTblString = getSecureTable(table);//get secure table string to  use in queries
        StringBuilder sbsql = new StringBuilder();
        sbsql.Append(@"select JSON_OBJECT(");//build query based on column names contained in "cols" parameter
        sbsql.Append(getSecureJsonColumns(cols, safeTblString));
        sbsql.Append(" from  ");
        sbsql.Append(safeTblString);
        string sqlstring = sbsql.ToString();

        Context.Response.Clear();
        Context.Response.ContentType = "application/json";
        using (var con = new MySqlConnection(constr))
        {
            con.Open();
            StringBuilder sb = new StringBuilder();
            using (var cmd = new MySqlCommand(sqlstring, con))
            {
                MySqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    //remove single quotes from returned json "string" and add comma between objects in the array array 
                    sb.Append(reader[0].ToString().Replace("'", "")).Append(",");
                }
            }
            var js = new JavaScriptSerializer();
            js.MaxJsonLength = 111111111;//TODO: come back and change this
            string test = "[" + sb.Remove(sb.Length - 1, 1).ToString() + "]";
            Context.Response.Write(js.Serialize(test));
        }
    }

}
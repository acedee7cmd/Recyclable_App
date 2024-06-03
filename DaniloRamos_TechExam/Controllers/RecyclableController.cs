using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.SqlClient;
using DaniloRamos_TechExam.Models;

namespace DaniloRamos_TechExam.Controllers
{
    public class RecyclableController : Controller
    {
        RecyclableDBEntities db = new RecyclableDBEntities();
        // GET: Recyclable
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult RecyclableItem()
        {
            // Retrieve RecyclableType items ordered by id.
            var recyclableTypes = db.RecyclableTypes.OrderBy(a => a.id).ToList();

            // Create a default SelectList item
            var defaultItem = new List<RecyclableType>()
            {
                new RecyclableType { id = 0, Type = "Select Type" } // Ensure that the id '0' does not conflict with existing ids
            };

            // Union the default item with the recyclableTypes list
            var recyclableTypeList = defaultItem.Union(recyclableTypes).ToList();

            // Pass the combined list to the ViewBag
            ViewBag.RecyclableTypeId = new SelectList(recyclableTypeList, "id", "Type");

            return View();
        }


        public JsonResult listType()
        {
            try
            {
                var objList = db.RecyclableTypes
                    .Select(item => new
                    {
                        id = item.id,
                        Type = item.Type,
                        Rate = item.Rate,
                        MinKg = item.MinKg,
                        MaxKg = item.MaxKg,
                    })
                    .ToList();

                return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult listItem()
        {
            List<object> objList = new List<object>();

            using (var conn = new SqlConnection(db.Database.Connection.ConnectionString))
            {
                SqlCommand cmd = new SqlCommand("viewRecyclableItem", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                try
                {
                    conn.Open();
                    SqlDataReader rdr = cmd.ExecuteReader();

                    while (rdr.Read())
                    {
                        var item = new
                        {
                            id = Convert.ToInt32(rdr["id"]),
                            Type = rdr["Type"].ToString(),
                            ItemDescription = rdr["ItemDescription"].ToString(),
                            Weight = Convert.ToDecimal(rdr["Weight"]),
                            ComputedRate = Convert.ToDecimal(rdr["ComputedRate"]),
                        };

                        objList.Add(item);
                    }
                }
                catch (Exception e)
                {
                    return Json(new { data = e.Message }, JsonRequestBehavior.AllowGet);
                }
                finally
                {
                    conn.Close();
                }
            }

            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult saveRecyclable(RecyclableType rType)
        {
            try
            {
                string msg;

                if (rType.id == 0)
                {
                    db.RecyclableTypes.Add(rType);
                    msg = "Record was successfully saved.";
                }
                else
                {
                    var rType_edit = db.RecyclableTypes.Find(rType.id);
                    if (rType_edit != null)
                    {
                        db.Entry(rType_edit).CurrentValues.SetValues(rType);
                        msg = "Record was successfully updated.";
                    }
                    else
                    {
                        return Json("Record not found.", JsonRequestBehavior.AllowGet);
                    }
                }

                db.SaveChanges();
                return Json(msg, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(e.Message, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult saveRecyclableItem(RecyclableItem rItem, decimal MinKg, decimal MaxKg)
        {
            try
            {
                string msg;  
                string msg2 = null;  
                
                if (rItem.ComputedRate < MinKg || rItem.ComputedRate > MaxKg)
                {
                    msg2 = $"Computed Rate must be between {MinKg} and {MaxKg}.";
                }

                if (rItem.id == 0) 
                {
                    if (msg2 == null)  
                    {
                        db.RecyclableItems.Add(rItem);
                        msg = "Record was successfully saved.";
                        db.SaveChanges(); 
                    }
                    else
                    {
                        msg = "Failed to save record due to validation error.";
                    }
                }
                else 
                {
                    var rItem_edit = db.RecyclableItems.Find(rItem.id);
                    if (rItem_edit != null)
                    {
                        if (msg2 == null)  
                        {
                            db.Entry(rItem_edit).CurrentValues.SetValues(rItem);
                            msg = "Record was successfully updated.";
                            db.SaveChanges(); 
                        }
                        else
                        {
                            msg = "Failed to update record due to validation error.";
                        }
                    }
                    else
                    {
                        return Json(new { error = "Record not found." }, JsonRequestBehavior.AllowGet);
                    }
                }
                
                if (msg2 != null)
                {
                    return Json(new { msg = msg, msg2 = msg2 }, JsonRequestBehavior.AllowGet);
                }
                
                return Json(new { msg = msg }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { error = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult GetType(int id)
        {
            var rtype = db.RecyclableTypes.FirstOrDefault(n => n.id == id);
            if (rtype != null)
            {
                var result = new
                {
                    id = rtype.id,
                    Type = rtype.Type,
                    Rate = rtype.Rate,
                    MinKg = rtype.MinKg,
                    MaxKg = rtype.MaxKg,
                };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            return HttpNotFound();
        }

        public ActionResult GetItem(int id)
        {
            var rItems = (from type in db.RecyclableTypes
                          join item in db.RecyclableItems on type.id equals item.RecyclableTypeId
                          where item.id == id
                          select new
                          {
                              TypeId = type.id,
                              TypeName = type.Type,
                              
                              ItemId = item.id,
                              ItemDescription = item.ItemDescription,
                              Weight = item.Weight,
                              ComputedRate = item.ComputedRate
                          }).ToList(); 

            if (rItems.Any())
            {
                return Json(new { data = rItems }, JsonRequestBehavior.AllowGet);
            }
            return HttpNotFound("No items found."); 
        }


        public ActionResult DeleteType(int ID)
        {
            var rtype = db.RecyclableTypes.Find(ID);
            if (rtype != null)
            {
                db.RecyclableTypes.Remove(rtype);
                db.SaveChanges();
                return Json("Successfully removed record.", JsonRequestBehavior.AllowGet);
            }

            return Json("Record not found.", JsonRequestBehavior.AllowGet);
        }

        public ActionResult DeleteItem(int ID)
        {
            var rItem = db.RecyclableItems.Find(ID);
            if (rItem != null)
            {
                db.RecyclableItems.Remove(rItem);
                db.SaveChanges();
                return Json("Successfully removed record.", JsonRequestBehavior.AllowGet);
            }

            return Json("Record not found.", JsonRequestBehavior.AllowGet);
        }
    }
}
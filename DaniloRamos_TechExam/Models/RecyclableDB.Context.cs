﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DaniloRamos_TechExam.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class RecyclableDBEntities : DbContext
    {
        public RecyclableDBEntities()
            : base("name=RecyclableDBEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<RecyclableType> RecyclableTypes { get; set; }
        public virtual DbSet<RecyclableItem> RecyclableItems { get; set; }
    
        public virtual ObjectResult<viewRecyclable_Result> viewRecyclable()
        {
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<viewRecyclable_Result>("viewRecyclable");
        }
    }
}

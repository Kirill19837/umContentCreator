using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;
using umContentCreator.Core.Interfaces;
using umContentCreator.Core.Models;
using static Umbraco.Cms.Core.Constants.PropertyEditors.Aliases;

namespace umContentCreator.Core.Services;

public class PropertiesService : IPropertiesService
{
   private readonly IContentTypeService _contentTypeService;
   private readonly IDataTypeService _dataTypeService;
   private readonly IContentService _contentService;

   public PropertiesService(IContentTypeService contentTypeService, IDataTypeService dataTypeService, IContentService contentService)
   {
      _contentTypeService = contentTypeService;
      _dataTypeService = dataTypeService;
      _contentService = contentService;
   }

   public List<UmPropertyInfo> GetPropertiesByContentId(int contentId)
   {
       var content = GetContent(contentId);
       var contentType = _contentTypeService.Get(content.ContentTypeId);
       var textProperties = GetPropertiesFromContentType(contentType);
       
       AddPropertiesFromNestedContentItem(contentType, textProperties);

       return textProperties;
   }

   private void AddPropertiesFromNestedContentItem(IContentTypeBase contentType, List<UmPropertyInfo> textProperties)
   {
       var nestedContentPropertyTypes = contentType.PropertyTypes
           .Where(pt => pt.PropertyEditorAlias == NestedContent).ToList();

       foreach (var nestedContentPropertyType in nestedContentPropertyTypes)
       {
           var nestedContentDataType = _dataTypeService.GetDataType(nestedContentPropertyType.DataTypeId);
           var nestedContentConfig = nestedContentDataType?.ConfigurationAs<NestedContentConfiguration>();
           var nestedContentTypes = nestedContentConfig?.ContentTypes ?? Enumerable.Empty<NestedContentConfiguration.ContentType>();

           foreach (var nestedContentType in nestedContentTypes)
           {
               var nestedItemTypeInstance = _contentTypeService.Get(nestedContentType.Alias!);
               textProperties.AddRange(GetPropertiesFromContentType(nestedItemTypeInstance));
               AddPropertiesFromNestedContentItem(nestedItemTypeInstance, textProperties);
           }
       }
   }

   private static List<UmPropertyInfo> GetPropertiesFromContentType(IContentTypeBase contentType)
   {
       var textPropertyTypes = contentType.PropertyTypes
           .Where(pt => pt.PropertyEditorAlias is TextBox or TinyMce or TextArea);

       return textPropertyTypes.Select(propertyType => new UmPropertyInfo
       {
           PropertyName = $"{contentType.Name} - {propertyType.Name}",
           PropertyAlias = propertyType.Alias,
           PropertyEditorAlias = propertyType.PropertyEditorAlias
       }).ToList();
   }

   public bool UpdatePropertyFromNestedContent(UpdatePropertyModel model)
   {
       var content = GetContent(model.ContentId);
       var contentType = _contentTypeService.Get(content.ContentTypeId);
       
       foreach (var propertyType in contentType.PropertyTypes)
       {
           if (propertyType.PropertyEditorAlias != NestedContent)
           {
               continue;
           }
           
           if (!GetNestedContentJsonString(propertyType, content, out var nestedContentJsonString))
           {
               continue;
           }

           var nestedContentItems = JArray.Parse(nestedContentJsonString);

           if (!UpdatePropertyInJson(nestedContentItems, model.PropertyAlias, model.Value))
           {
               continue;
           }
           
           content.SetValue(propertyType.Alias, nestedContentItems.ToString());
           _contentService.Save(content);
           
           return true;
       }

       return false;
   }

   private static bool GetNestedContentJsonString(IPropertyType propertyType, IContentBase content,
       out string nestedContentJsonString)
   {
       nestedContentJsonString = content.GetValue<string>(propertyType.Alias);

       return !string.IsNullOrWhiteSpace(nestedContentJsonString);
   }

   private bool UpdatePropertyInJson(JToken token, string propertyAlias, object value)
   {
       switch (token.Type)
       {
           case JTokenType.Object:
           {
               if (UpdateProperty(token, propertyAlias, value))
               {
                   return true;
               }

               break;
           }
           case JTokenType.Array:
           {
               var jArray = (JArray)token;
               
               if (jArray.Any(element => UpdatePropertyInJson(element, propertyAlias, value)))
               {
                   return true;
               }

               break;
           }
           case JTokenType.String:
           {
               try
               {
                   var parsedToken = JToken.Parse(token.ToString());

                   if (UpdatePropertyInJson(parsedToken, propertyAlias, value))
                   {
                       token.Replace(parsedToken);
                       return true;
                   }
               }
               catch (Exception e)
               {
                   Console.WriteLine(e);
               }
               
               break;
           }
       }

       return false;
   }

   private bool UpdateProperty(JToken token, string propertyAlias, object value)
   {
       var jObject = (JObject)token;

       if (!jObject.ContainsKey(propertyAlias))
       {
           return jObject.Properties().Any(property => UpdatePropertyInJson(property.Value, propertyAlias, value));
       }
       
       jObject[propertyAlias] = JToken.FromObject(value);
       return true;
   }

   private IContent GetContent(int contentId)
   {
       var content = _contentService.GetById(contentId);

       if (content == null)
       {
           throw new Exception();
       }

       return content;
   }
}
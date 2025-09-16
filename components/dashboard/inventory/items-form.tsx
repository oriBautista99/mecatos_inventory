import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCategoriesSWR } from "@/hooks/useCategoriesSWR";
import { useItemTypesSWR } from "@/hooks/useItemTypesSWR";
import { useStorageAreasSWR } from "@/hooks/useStorageAreas";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { UNITS } from "@/types/constants";
import { Item, ItemFormValues, ItemSchema } from "@/types/item"
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, PackageOpen, Save, ShoppingCart, Tags, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

interface ItemModalProps {
  onClose: () => void
  onSave: (item: ItemFormValues) => void
  item?: Item | null
}

export function ItemsForm({ onClose, onSave, item }: ItemModalProps){

  const { itemTypes = [], isLoading: isLoadingTypes } = useItemTypesSWR();
  const { areas = [], isLoading: isLoadingAreas } = useStorageAreasSWR();
  const { categories = [], isLoading: isLoadingCategories } = useCategoriesSWR();
  const { suppliers = [], isLoading: isLoadingSuppliers } = useSuppliersSWR();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const t = useTranslations("ITEMS-FORM");
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(ItemSchema),
    defaultValues: {
      name: "",
      description: "",
      base_unit: "",
      category_id: "",
      item_type_id: "",
      min_quantity: 1,
      target_quantity: 1,
      storage_area_id: "",
      presentations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "presentations",
  });

  useEffect(() => {
    if(item && !isLoadingCategories && !isLoadingAreas && !isLoadingSuppliers && !isLoadingTypes){
        console.log(item);        
        reset({
          name: item.name ?? "",
          description: item.description ?? "",
          base_unit: item.base_unit ?? "",
          category_id: item.category_id ? String(item.category_id) : "",
          item_type_id: item.item_type_id ? String(item.item_type_id) : "",
          storage_area_id: item.storage_area_id ? String(item.storage_area_id) : "",
          min_quantity: item.min_quantity ?? 1,
          target_quantity: item.target_quantity ?? 1,
          presentations: (item.presentations ?? []).map(p => ({
            name: p.name ?? "",
            description: p.description ?? "",
            quantity: p.quantity ?? 1,
            unit: p.unit ?? "u",
            conversion_factor: p.conversion_factor ?? 1,
            supplier_ids: p.suppliers_presentations?.map(sp => String(sp.suppliers.supplier_id)) ?? [],
            item_id: String(p.item_id ?? item.item_id ?? ""),
            presentation_id: p.presentation_id ?? p.presentation_id ?? ""
          }))
        });
          console.log('FORMULARIO RESET')
        
        const timer: NodeJS.Timeout = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(timer)
            setLoading(false)
            return 100
          }
          return old + 20
        })
        }, 150)
        return () => clearInterval(timer)    
    }
  },[item, reset, isLoadingCategories, isLoadingAreas, isLoadingSuppliers, isLoadingTypes]);

  return(
    <div>
      <SheetHeader className="space-y-2 sm:space-y-3 mb-3 p-2">
        <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Package className="h-4 w-4 sm:h-5 sm:w-5" />
          {item ? t("EDIT-ITEM") : t("CREATE-ITEM")}
        </SheetTitle>
        <SheetDescription className="text-sm">
          {item
            ? t("EDIT-DESCRIPTION")
            : t("CREATE-DESCRIPTION")
          }
        </SheetDescription>
      </SheetHeader> 
      <Separator/>  
      {
        loading && item ? (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <span className="text-muted-foreground">
              {t("LOADING")}
            </span>
            <Progress value={progress} className="w-2/3 h-3"/>
          </div>
        ) : (
          <form  onSubmit={handleSubmit(onSave)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {/* Item information */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <PackageOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm sm:text-base">{t("PRODUCT-INFO")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">
                        {t("NAME")} *
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Ej: Distribuidora Central S.A."
                        className={`text-sm ${errors.name ? "border-destructive" : ""}`}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">
                        {t("DESCRIPTION")}
                      </Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder={t("DESCRIPTION-PLACEHOLDER")}
                        className={`text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                        rows={2}
                      />
                      {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("ITEM-TYPE")} *
                      </Label>
                      <Controller
                        control={control}
                        name="item_type_id"
                        render={({ field }) => (
                        
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => {
                              field.onChange(String(val));
                            }}
                          >
                            <SelectTrigger id="item_types" className='relative w-full ps-9 text-sm py-2'>
                              <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tags size={12} aria-hidden='true' />
                              </div>
                              <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SELECT")}></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {itemTypes.map((type) => (
                                <SelectItem key={type.item_type_id} value={String(type.item_type_id)}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        
                      )}
                      />            

                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("STORAGE_AREAS")} *
                      </Label>   
                      <Controller
                        control={control}          
                        name="storage_area_id" 
                        render={({field}) => (
                          <Select 
                            value={field.value ? String(field.value) : ""} 
                            onValueChange={field.onChange}                   
                          >
                            <SelectTrigger id="storage_areas" className='relative w-full ps-9 text-sm py-2'>
                                <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                    <Tags size={12} aria-hidden='true' />
                                </div>
                                <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SELECT")} />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    areas.map((area) => (
                                        <SelectItem 
                                            className="text-sm sm:text-base lg:text-sm"
                                            key={area.storage_area_id} 
                                            value={String(area.storage_area_id)}
                                        >
                                            {area.name}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                          </Select>                      
                        )}
                      />         

                    </div>
                  </div>
                  <div className="md:col-start-2 md:row-start-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("BASE_UNIT")} *
                      </Label>
                      <Controller
                        control={control}          
                        name="base_unit"
                        render={({field})=> (
                        <Select   
                          value={field.value ? String(field.value) : ""}
                          onValueChange={field.onChange}                     
                        >
                          <SelectTrigger id="base_unit" className='relative w-full ps-9 text-sm py-2'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tags size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SELECT")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem 
                              className="text-sm sm:text-base lg:text-sm"
                              key={UNITS.LB} 
                              value={UNITS.LB}
                            >
                              {UNITS.LB}
                            </SelectItem>
                            <SelectItem 
                              className="text-sm sm:text-base lg:text-sm"
                              key={UNITS.OZ} 
                              value={UNITS.OZ}
                            >
                              {UNITS.OZ}
                            </SelectItem>
                            <SelectItem 
                              className="text-sm sm:text-base lg:text-sm"
                              key={UNITS.U} 
                              value={UNITS.U}
                            >
                              {UNITS.U}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        )} 
                      />

                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("QY_MIN")} *
                      </Label>            
                      <div className='relative'>
                        <Input
                          id="min_quantity"
                          type='number'
                          {...register("min_quantity")}
                          placeholder="01"
                          min={1}
                          className={`text-sm ${errors.min_quantity ? "border-destructive" : ""}`}
                        />                    
                        <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-9 text-sm peer-disabled:opacity-50'>
                          lb
                        </span>
                      </div>
                      {errors.min_quantity && <p className="text-xs text-destructive">{errors.min_quantity.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("QY_TARGET")} *
                      </Label>            
                      <div className='relative'>
                        <Input
                          id="target_quantity"
                          type='number'
                          {...register("target_quantity")}
                          placeholder="01"
                          min={1}
                          className={`text-sm ${errors.target_quantity ? "border-destructive" : ""}`}
                        />                    
                        <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-9 text-sm peer-disabled:opacity-50'>
                          lb
                        </span>
                      </div>
                      {errors.target_quantity && <p className="text-xs text-destructive">{errors.target_quantity.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("CATEGORY")} *
                      </Label>   
                      <Controller
                        control={control}          
                        name="category_id"
                        render={({field})=> (
                          <Select value={String(field.value)} onValueChange={field.onChange}>
                            <SelectTrigger id="category" className='relative w-full ps-9 text-sm py-2'>
                                <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                    <Tags size={12} aria-hidden='true' />
                                </div>
                                <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SELECT")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem 
                                  className="text-sm sm:text-base lg:text-sm"
                                  key={category.category_id} 
                                  value={String(category.category_id)}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>                     
                        )}
                      />         
                      
                    </div>
                  </div>
                </div>           
              </div>
              <Separator/>  
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm sm:text-base">{t("PRESENTATIONS")}</h3>
                </div>
                {
                  fields.map((field, index) => (
                    <Card key={field.id} className="p-2 relative flex flex-col space-y-2">
                        <Button
                          variant='ghost' size='sm'
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-secondary-foreground"
                        >
                          <X />
                        </Button>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm sm:text-sm py-3">{t("INFO-PRESENTATIONS")}</h3>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4 items-center">
                          <div className="space-y-1">
                            <Label htmlFor={`presentations.${index}.name`}>{t("NAME-PRES")}</Label>
                            <Input
                              id={`presentations.${index}.name`}
                              {...register(`presentations.${index}.name`)}
                              placeholder="Ej: Caja grande"
                            />
                            {errors.presentations?.[index]?.name && (
                              <p className="text-xs text-red-500">
                                {errors.presentations[index]?.name?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`presentations.${index}.supplier_ids`}>{t("SUPPLIER")}</Label>
                            <Controller
                              control={control}
                              name={`presentations.${index}.supplier_ids`}
                              render={({ field }) => (
                                <MultiSelect
                                  options={suppliers.map(supplier => ({
                                    label: supplier.company_name,
                                    value: String(supplier.supplier_id)
                                  }))}
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  placeholder={t("SELECT")}
                                  autoSize={false}
                                  variant={"default"}                                  
                                  className=" w-full text-sm sm:text-base lg:text-sm bg-background "
                                  
                                />)
                              }
                            />
                          </div>
                        </div>      
                        <div className="w-full grid grid-cols-3 grid-rows-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`presentations.${index}.quantity`} className="text-sm">
                              {t("QY")}
                            </Label>            
                            <Input
                              id={`presentations.${index}.quantity`}
                              type='number'
                              {...register(`presentations.${index}.quantity`)}
                              placeholder="01"
                              min={1}
                              className={`text-sm ${errors.presentations?.[index]?.quantity ? "border-destructive" : ""}`}
                            />  
                            {errors.presentations?.[index]?.quantity && (
                              <p className="text-xs text-destructive">
                                {errors.presentations[index]?.quantity?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`presentations.${index}.unit`} className="text-sm">
                              {t("UNIT")}
                            </Label>            
                            <Controller
                              control={control}          
                              name={`presentations.${index}.unit`}
                              render={({field})=> (
                              <Select   
                                value={field.value}
                                onValueChange={field.onChange}                     
                              >
                                <SelectTrigger id={`presentations.${index}.unit`}className='relative w-full ps-9 text-sm py-2'>
                                  <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                      <Tags size={12} aria-hidden='true' />
                                  </div>
                                  <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder="Selecciona una" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem 
                                    className="text-sm sm:text-base lg:text-sm"
                                    key={UNITS.LB} 
                                    value={UNITS.LB}
                                  >
                                    {UNITS.LB}
                                  </SelectItem>
                                  <SelectItem 
                                    className="text-sm sm:text-base lg:text-sm"
                                    key={UNITS.OZ} 
                                    value={UNITS.OZ}
                                  >
                                    {UNITS.OZ}
                                  </SelectItem>
                                  <SelectItem 
                                    className="text-sm sm:text-base lg:text-sm"
                                    key={UNITS.U} 
                                    value={UNITS.U}
                                  >
                                    {UNITS.U}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              )} 
                            />
                            {errors.presentations?.[index]?.unit && (
                              <p className="text-xs text-destructive">
                                {errors.presentations[index]?.unit?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`presentations.${index}.conversion_factor`} className="text-sm">
                              {t("CONVERSION-FACTOR")}
                            </Label>            
                            <Input
                              id={`presentations.${index}.conversion_factor`}
                              type='number'
                              {...register(`presentations.${index}.conversion_factor`)}
                              placeholder="01"
                              min={1}
                              className={`text-sm ${errors.presentations?.[index]?.conversion_factor ? "border-destructive" : ""}`}
                            />  
                            {errors.presentations?.[index]?.conversion_factor && (
                              <p className="text-xs text-destructive">
                                {errors.presentations[index]?.conversion_factor?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`presentations.${index}.description`} className="text-sm">
                            {t("NOTES")} *
                          </Label>
                          <Textarea
                            id={`presentations.${index}.description`}
                            {...register(`presentations.${index}.description`)}
                            placeholder="Agrega algun comentario"
                            className={`text-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                            rows={2}
                          />
                          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>        
                    </Card>
                ))}
                <Button
                  variant='outline'
                  onClick={() => append({ 
                    name: "", 
                    quantity: 1, 
                    unit: "u", 
                    conversion_factor: 1, 
                    description: "",
                    supplier_ids: []
                  })}
                  className='border-primary border-dashed shadow-none w-full'
                >
                  + {t("ADD_PRESENTATIONS")}
                </Button>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button type="submit" className="flex-1 text-sm">
                  <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {item ? t("UPDATE_ITEM") : t("SAVE_ITEM")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 sm:flex-none text-sm bg-transparent"
                >
                  <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {t("CANCEL")}
                </Button>
              </div>
          </form>  
        )
      }
    </div>
  ); 
}
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCategoriesSWR } from "@/hooks/useCategoriesSWR";
import { useItemTypesSWR } from "@/hooks/useItemTypesSWR";
import { usePresentationTypesSWR } from "@/hooks/usePresentationTypes";
import { useStorageAreasSWR } from "@/hooks/useStorageAreas";
import { useSuppliersSWR } from "@/hooks/useSuppliers";
import { useUnitsSWR } from "@/hooks/useUnits";
import { TYPE_PRODUCTION } from "@/types/constants";
import { Item, ItemFormValues, ItemSchema } from "@/types/item"
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Package, PackageOpen, Save, ShoppingCart, Tags, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

interface ItemModalProps {
  onClose: () => void
  onSave: (item: ItemFormValues) => void
  item?: Item | null
}

export function ItemsForm({ onClose, onSave, item }: ItemModalProps){

  const { itemTypes = [], isLoading: isLoadingTypes } = useItemTypesSWR();
  const { units = [], isLoading: isLoadingUnits } = useUnitsSWR();
  const { areas = [], isLoading: isLoadingAreas } = useStorageAreasSWR();
  const { categories = [], isLoading: isLoadingCategories } = useCategoriesSWR();
  const { suppliers = [], isLoading: isLoadingSuppliers } = useSuppliersSWR();
  const { presentationsTypes = [], isLoading: isLoadingPresenTypes } = usePresentationTypesSWR();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const t = useTranslations("ITEMS-FORM");

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(ItemSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      item_type_id: "",
      min_quantity: 1,
      target_quantity: 1,
      storage_area_id: "",
      unit_id: "",
      production_type: "",
      shelf_life_days: "",
      item_presentations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "item_presentations",
  });

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name?.includes("presentation_type_id")) {
        const match = name.match(/item_presentations\.(\d+)\.presentation_type_id/);
        if (!match) return;
        const index = Number(match[1]);
        const presTypeId = values.item_presentations && values.item_presentations[index]?.presentation_type_id;
        if (!presTypeId) return;
        const selectedPres = presentationsTypes.find(
          (p) => String(p.presentation_type_id) === String(presTypeId)
        );
        if (selectedPres) {
          setValue(`item_presentations.${index}.conversion_factor`, selectedPres.conversion_factor);
          setValue(`item_presentations.${index}.unit`, String(selectedPres.unit.unit_id));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, presentationsTypes]);

  const baseUnit = useWatch({
    control,
    name: "unit_id",
  });

  useEffect(() => {
    if(item && !isLoadingCategories && !isLoadingAreas && !isLoadingSuppliers && !isLoadingTypes && !isLoadingUnits && !isLoadingPresenTypes){     
        reset({
          name: item.name ?? "",
          description: item.description ?? "",
          unit_id: item.unit_id ? String(item.unit_id) : "",
          category_id: item.category_id ? String(item.category_id) : "",
          item_type_id: item.item_type_id ? String(item.item_type_id) : "",
          storage_area_id: item.storage_area_id ? String(item.storage_area_id) : "",
          min_quantity: item.min_quantity ?? 1,
          target_quantity: item.target_quantity ?? 1,
          shelf_life_days: item.shelf_life_days ?? '',
          production_type: item.production_type ?? '',
          item_presentations: (item.item_presentations ?? []).map(p => ({
            presentation_type_id: p.presentation_types ? String(p.presentation_types.presentation_type_id) : "",
            name: p.presentation_types.name ?? "",
            description: p.presentation_types.description ?? "",
            quantity: p.quantity ?? 1,
            unit: p.presentation_types.unit.unit_id ?? "",
            conversion_factor: p.presentation_types.conversion_factor ?? 0,
            supplier_ids: p.suppliers_presentations?.map(sp => String(sp.suppliers.supplier_id)) ?? [],
            item_id: String(p.item_id ?? item.item_id ?? ""),
            item_presentation_id: p.item_presentation_id ?? p.item_presentation_id ?? "",
            is_default: p.is_default
          }))
        });
        
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
  },[item, reset, isLoadingCategories, isLoadingAreas, isLoadingSuppliers, isLoadingTypes, isLoadingUnits, isLoadingPresenTypes]);

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
          <form  onSubmit={handleSubmit(
  (data) => {
    onSave(data);
  },
  (errors) => {
    console.log("Errores del formulario:", errors);
  }
)} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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
                        className={`text-sm resize-none min-h-10 h-10 ${errors.description ? "border-destructive" : ""}`}
                        rows={1}
                      />
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
                      {errors.item_type_id && <p className="text-xs text-destructive">{errors.item_type_id.message}</p>}
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
                      {errors.storage_area_id && <p className="text-xs text-destructive">{errors.storage_area_id.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t(("TYPE_PRODUCTION"))}
                      </Label>  
                      <Controller
                        control={control}          
                        name="production_type"
                        render={({field})=> (
                        <Select   
                          value={field.value ? String(field.value) : ""}
                          onValueChange={field.onChange}                     
                        >
                          <SelectTrigger id="production_type" className='relative w-full ps-9 text-sm py-2'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tags size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SELECT")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem 
                              className="text-sm sm:text-base lg:text-sm"
                              key={TYPE_PRODUCTION.BREAD} 
                              value={TYPE_PRODUCTION.BREAD}
                            >
                              {TYPE_PRODUCTION.BREAD}
                            </SelectItem>
                            <SelectItem 
                              className="text-sm sm:text-base lg:text-sm"
                              key={TYPE_PRODUCTION.DESSERT} 
                              value={TYPE_PRODUCTION.DESSERT}
                            >
                              {TYPE_PRODUCTION.DESSERT}
                            </SelectItem>
                            <SelectItem 
                              className="text-sm sm:text-base lg:text-sm"
                              key={TYPE_PRODUCTION.PASTRY} 
                              value={TYPE_PRODUCTION.PASTRY}
                            >
                              {TYPE_PRODUCTION.PASTRY}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        )} 
                      />
                      <p className="text-xs text-muted-foreground">{t("INFO_TYPE_PRODUCTION")}</p>
                    </div>
                  </div>
                  <div className="md:col-start-2 md:row-start-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("BASE_UNIT")} *
                      </Label>
                      <Controller
                        control={control}          
                        name="unit_id"
                        render={({field})=> (
                        <Select   
                          value={field.value ? String(field.value) : ""}
                          onValueChange={field.onChange}                     
                        >
                          <SelectTrigger id="unit_id" className='relative w-full ps-9 text-sm py-2'>
                            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                <Tags size={12} aria-hidden='true' />
                            </div>
                            <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder={t("SELECT")} />
                          </SelectTrigger>
                          <SelectContent>
                            {
                                units.map((unit) => (
                                    <SelectItem 
                                        className="text-sm sm:text-base lg:text-sm"
                                        key={unit.unit_id} 
                                        value={String(unit.unit_id)}
                                    >
                                        {unit.name} ({unit.abbreviation})
                                    </SelectItem>
                                ))
                            }
                          </SelectContent>
                        </Select>
                        )} 
                      />
                      {errors.unit_id && <p className="text-xs text-destructive">{errors.unit_id.message}</p>}
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
                          {units.find( u => u.unit_id == baseUnit)?.abbreviation || "—"}
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
                          {units.find( u => u.unit_id == baseUnit)?.abbreviation || "—"}
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
                      {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm">
                        {t("LIFE_DAYS")}
                      </Label>  
                       <Input
                          id="shelf_life_days"
                          type='number'
                          {...register("shelf_life_days")}
                          placeholder="Ej: 7"
                          min={1}
                          className={`text-sm ${errors.shelf_life_days ? "border-destructive" : ""}`}
                        /> 
                      <p className="text-xs text-muted-foreground">{t("INFO_LIFE_DAYS")}</p>
                    </div>
                  </div>
                </div>           
              </div>
              <Separator/>  
              {/* Presentations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm sm:text-base">{t("PRESENTATIONS")}</h3>
                </div>
                {
                  fields.map((field, index) => (
                    <Card key={field.id} className="p-3 relative flex flex-col space-y-2">
                        <Button
                          variant='ghost' size='sm'
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-secondary-foreground"
                        >
                          <X />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4"></Box>
                          <h3 className="font-semibold text-md sm:text-sm">{t("INFO-PRESENTATIONS")}</h3>
                        </div>
                        <div className="w-full grid grid-cols-3 gap-4 items-center">
                          <div className="space-y-1">
                            <Label htmlFor={`item_presentations.${index}.presentation_type_id`}>{t("NAME-PRES")}</Label>
                            <Controller
                              control={control}
                              name={`item_presentations.${index}.presentation_type_id`}
                              render={({field})=> (
                              <Select   
                                value={field.value ? String(field.value) : ""}
                                onValueChange={(val) => field.onChange(val)}                   
                              >
                                <SelectTrigger id={`item_presentations.${index}.presentation_type_id`} className='relative w-full ps-9 text-sm py-2'>
                                  <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50'>
                                      <Tags size={12} aria-hidden='true' />
                                  </div>
                                  <SelectValue className="text-sm sm:text-base lg:text-sm tracking-tight" placeholder="Selecciona una" />
                                </SelectTrigger>
                                <SelectContent>
                                  {
                                      presentationsTypes.map((type) => (
                                          <SelectItem 
                                              className="text-sm sm:text-base lg:text-sm"
                                              key={type.presentation_type_id} 
                                              value={String(type.presentation_type_id)}
                                          >
                                              {type.name} ({type.unit.abbreviation})
                                          </SelectItem>
                                      ))
                                  }
                                </SelectContent>
                              </Select>
                              )} 
                            />
                            {errors.item_presentations?.[index]?.presentation_type_id && (
                              <p className="text-xs text-red-500">
                                {errors.item_presentations[index]?.presentation_type_id?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item_presentations.${index}.unit`} className="text-sm">
                              {t("UNIT")}
                            </Label>            
                            <Controller
                              control={control}
                              name={`item_presentations.${index}.unit`}
                              render={({ field }) => (
                                <Select value={field.value} disabled>
                                  <SelectTrigger id={`item_presentations.${index}.unit`} className="relative w-full ps-9 text-sm py-2 bg-muted cursor-not-allowed">
                                    <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3'>
                                      <Tags size={12} aria-hidden='true' />
                                    </div>
                                    <SelectValue placeholder="Selecciona una" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {units.map((unit) => (
                                      <SelectItem key={unit.unit_id} value={String(unit.unit_id)}>
                                        {unit.name} ({unit.abbreviation})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item_presentations.${index}.conversion_factor`} className="text-sm">
                              {t("CONVERSION-FACTOR")}
                            </Label>            
                            <Input
                              id={`item_presentations.${index}.conversion_factor`}
                              type='number'
                              {...register(`item_presentations.${index}.conversion_factor`)}
                              readOnly
                              className="text-sm bg-muted cursor-not-allowed"
                            />
                          </div>
                        </div>      
                        <div className="w-full grid grid-cols-3 grid-rows-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`item_presentations.${index}.supplier_ids`}>{t("SUPPLIER")}</Label>
                            <Controller
                              control={control}
                              name={`item_presentations.${index}.supplier_ids`}
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
                          <div className="space-y-2">
                            <Label htmlFor={`item_presentations.${index}.quantity`} className="text-sm">
                              {t("QY")}
                            </Label>            
                            <Input
                              id={`item_presentations.${index}.quantity`}
                              type='number'
                              {...register(`item_presentations.${index}.quantity`)}
                              placeholder="01"
                              min={1}
                              className={`text-sm ${errors.item_presentations?.[index]?.quantity ? "border-destructive" : ""}`}
                            />  
                            {errors.item_presentations?.[index]?.quantity && (
                              <p className="text-xs text-destructive">
                                {errors.item_presentations[index]?.quantity?.message}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-start items-center">
                            <Controller
                              control={control}
                              name={`item_presentations.${index}.is_default`}
                              defaultValue={false}
                              render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`item_presentations.${index}.is_default`}
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(!!checked)}
                                  />
                                  <Label htmlFor={`item_presentations.${index}.is_default`} className="text-sm">
                                    Presentacion principal
                                  </Label>
                                </div>
                              )}
                            />
                          </div>
                        </div>
                    </Card>
                ))}
                <Button
                  variant='outline'
                  onClick={() => append({ 
                    conversion_factor: 0,
                    unit: "",
                    presentation_type_id: "", 
                    quantity: 0, 
                    is_default: true,
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
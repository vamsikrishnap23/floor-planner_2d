import { z } from 'zod';
export declare const SiteNode: z.ZodObject<{
    object: z.ZodDefault<z.ZodLiteral<"node">>;
    name: z.ZodOptional<z.ZodString>;
    parentId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    visible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    camera: z.ZodOptional<z.ZodObject<{
        position: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        target: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        mode: z.ZodDefault<z.ZodEnum<{
            perspective: "perspective";
            orthographic: "orthographic";
        }>>;
        fov: z.ZodOptional<z.ZodNumber>;
        zoom: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    metadata: z.ZodDefault<z.ZodOptional<z.ZodJSONSchema>>;
    id: z.ZodDefault<z.ZodTemplateLiteral<`site_${string}`>>;
    type: z.ZodDefault<z.ZodLiteral<"site">>;
    polygon: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"polygon">;
        points: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    }, z.core.$strip>>>;
    children: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        object: z.ZodDefault<z.ZodLiteral<"node">>;
        name: z.ZodOptional<z.ZodString>;
        parentId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        visible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        camera: z.ZodOptional<z.ZodObject<{
            position: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            target: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            mode: z.ZodDefault<z.ZodEnum<{
                perspective: "perspective";
                orthographic: "orthographic";
            }>>;
            fov: z.ZodOptional<z.ZodNumber>;
            zoom: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        metadata: z.ZodDefault<z.ZodOptional<z.ZodJSONSchema>>;
        id: z.ZodDefault<z.ZodTemplateLiteral<`building_${string}`>>;
        type: z.ZodDefault<z.ZodLiteral<"building">>;
        children: z.ZodDefault<z.ZodArray<z.ZodDefault<z.ZodTemplateLiteral<`level_${string}`>>>>;
        position: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        rotation: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
    }, z.core.$strip>, z.ZodObject<{
        object: z.ZodDefault<z.ZodLiteral<"node">>;
        name: z.ZodOptional<z.ZodString>;
        parentId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        visible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        camera: z.ZodOptional<z.ZodObject<{
            position: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            target: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
            mode: z.ZodDefault<z.ZodEnum<{
                perspective: "perspective";
                orthographic: "orthographic";
            }>>;
            fov: z.ZodOptional<z.ZodNumber>;
            zoom: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        metadata: z.ZodDefault<z.ZodOptional<z.ZodJSONSchema>>;
        id: z.ZodDefault<z.ZodTemplateLiteral<`item_${string}`>>;
        type: z.ZodDefault<z.ZodLiteral<"item">>;
        position: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        rotation: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        scale: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        side: z.ZodOptional<z.ZodEnum<{
            front: "front";
            back: "back";
        }>>;
        children: z.ZodDefault<z.ZodArray<z.ZodDefault<z.ZodTemplateLiteral<`item_${string}`>>>>;
        wallId: z.ZodOptional<z.ZodString>;
        wallT: z.ZodOptional<z.ZodNumber>;
        collectionIds: z.ZodOptional<z.ZodArray<z.ZodCustom<`collection_${string}`, `collection_${string}`>>>;
        asset: z.ZodObject<{
            id: z.ZodString;
            category: z.ZodString;
            name: z.ZodString;
            thumbnail: z.ZodString;
            src: z.ZodString;
            dimensions: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            attachTo: z.ZodOptional<z.ZodEnum<{
                wall: "wall";
                "wall-side": "wall-side";
                ceiling: "ceiling";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            offset: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            rotation: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            scale: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            surface: z.ZodOptional<z.ZodObject<{
                height: z.ZodNumber;
            }, z.core.$strip>>;
            interactive: z.ZodOptional<z.ZodObject<{
                controls: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"toggle">;
                    label: z.ZodOptional<z.ZodString>;
                    default: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"slider">;
                    label: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    step: z.ZodDefault<z.ZodNumber>;
                    unit: z.ZodOptional<z.ZodString>;
                    displayMode: z.ZodDefault<z.ZodEnum<{
                        slider: "slider";
                        stepper: "stepper";
                        dial: "dial";
                    }>>;
                    default: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"temperature">;
                    label: z.ZodDefault<z.ZodString>;
                    min: z.ZodDefault<z.ZodNumber>;
                    max: z.ZodDefault<z.ZodNumber>;
                    unit: z.ZodDefault<z.ZodEnum<{
                        C: "C";
                        F: "F";
                    }>>;
                    default: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>], "kind">>>;
                effects: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"animation">;
                    clips: z.ZodObject<{
                        on: z.ZodOptional<z.ZodString>;
                        off: z.ZodOptional<z.ZodString>;
                        loop: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                }, z.core.$strip>, z.ZodObject<{
                    kind: z.ZodLiteral<"light">;
                    color: z.ZodDefault<z.ZodString>;
                    intensityRange: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
                    distance: z.ZodOptional<z.ZodNumber>;
                    offset: z.ZodDefault<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
                }, z.core.$strip>], "kind">>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>], "type">>>;
}, z.core.$strip>;
export type SiteNode = z.infer<typeof SiteNode>;
//# sourceMappingURL=site.d.ts.map
import { z } from 'zod';
export declare const LevelNode: z.ZodObject<{
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
    id: z.ZodDefault<z.ZodTemplateLiteral<`level_${string}`>>;
    type: z.ZodDefault<z.ZodLiteral<"level">>;
    children: z.ZodDefault<z.ZodArray<z.ZodUnion<readonly [z.ZodDefault<z.ZodTemplateLiteral<`wall_${string}`>>, z.ZodDefault<z.ZodTemplateLiteral<`zone_${string}`>>, z.ZodDefault<z.ZodTemplateLiteral<`slab_${string}`>>, z.ZodDefault<z.ZodTemplateLiteral<`ceiling_${string}`>>, z.ZodDefault<z.ZodTemplateLiteral<`roof_${string}`>>, z.ZodDefault<z.ZodTemplateLiteral<`scan_${string}`>>, z.ZodDefault<z.ZodTemplateLiteral<`guide_${string}`>>]>>>;
    level: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type LevelNode = z.infer<typeof LevelNode>;
//# sourceMappingURL=level.d.ts.map
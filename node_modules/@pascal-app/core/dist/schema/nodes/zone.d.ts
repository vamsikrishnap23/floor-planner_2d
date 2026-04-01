import { z } from 'zod';
export declare const ZoneNode: z.ZodObject<{
    object: z.ZodDefault<z.ZodLiteral<"node">>;
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
    id: z.ZodDefault<z.ZodTemplateLiteral<`zone_${string}`>>;
    type: z.ZodDefault<z.ZodLiteral<"zone">>;
    name: z.ZodString;
    polygon: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    color: z.ZodDefault<z.ZodString>;
    metadata: z.ZodDefault<z.ZodOptional<z.ZodJSONSchema>>;
}, z.core.$strip>;
export type ZoneNode = z.infer<typeof ZoneNode>;
//# sourceMappingURL=zone.d.ts.map
export const asyncHandler = (routeFunction)=>{
    return async(req,res)=>{
        try{
            await routeFunction(req,res);
        }catch(error){
            res.status(error.statusCode || 500).json({
                success:false,
                message:error.message
            })
        }
    }
}


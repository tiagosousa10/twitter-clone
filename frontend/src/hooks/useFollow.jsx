import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
   const queryClient = useQueryClient(); 

   const {mutate:follow, isPending} = useMutation({
      mutationFn: async(userId) => {
         try {
            const res= await fetch(`/api/users/follow/${userId}`, {
               method: 'POST',
            })
   
            const data = await res.json()
            if(!res.ok) throw new Error(data.error || 'Failed to follow user');
            return ;

         } catch(error) {
            throw new Error(error.message);
         }
      },
      onSuccess: () => {
         Promise.all([ // update all the queries
            queryClient.invalidateQueries({queryKey: ['suggestedUsers']}), // update the suggestedUsers
            queryClient.invalidateQueries({queryKey: ['authUser']}), //update the authUser
         ])
      },
      onError: (error) => {
         toast.error(error.message);
      }
   })

   return {follow, isPending}
}

export default useFollow;

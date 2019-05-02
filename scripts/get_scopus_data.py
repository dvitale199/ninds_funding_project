import pandas as pd
from scopus import AuthorSearch
from scopus import AuthorRetrieval
from scopus import ContentAffiliationRetrieval

# Function to format ninds name
def format_ninds_name(name):
    if ',' not in name:
        pass
    else:
        name_split = name.split(', ')
        if len(name_split[1].split()) > 1:
            last = name_split[0].title()
            middle = name_split[1].lstrip().split(' ')[1].title()[0]
            first = name_split[1].lstrip().split(' ')[0].title()
        else:
            last = name_split[0].title()
            middle = ''
            first = name_split[1].lstrip().title()
        first_middle = first + ' ' + middle
        return first_middle, last

# Get ninds
ninds = pd.read_csv('data/combined_data/ninds_no_scopus_idx.csv')
ninds.columns = map(str.lower, ninds.columns)

# Get contact pi / project leader
contact_pi_project_leader = ninds.loc[:, 'contact pi / project leader']

# Apply format_ninds_name to contact_pi_project_leader
scopus_idx = pd.Series(contact_pi_project_leader.apply(format_ninds_name))

# Add scopus_idx to ninds
ninds['scopus idx'] = scopus_idx
ninds.to_csv('data/combined_data/ninds_scopus_idx_data.csv')

# Get unique names from scopus pi
scopus_search = scopus_idx.unique()
# Scopus API Key allows for 5000 requests
print(len(scopus_search))
# scopus_search contains 15499 unique names

# Create empty data frames for data
scopus = pd.DataFrame()
jour = pd.DataFrame()
coauth = pd.DataFrame()
aff = pd.DataFrame()

# Scopus search
for i in range(0, 500):
    try:
        # Use AuthorSearch
        auth_search = AuthorSearch('AUTHLAST(' + scopus_search[i][1] + ') and AUTHFIRST(' + scopus_search[i][0] + ')', refresh = True)
        auth_search_df = pd.DataFrame(auth_search.authors)
        auth_search_df = auth_search_df.iloc[0, :]

        # Get auth_retrieval_id
        eid = auth_search_df['eid']
        auth_retrieval_id = eid[7:]

        # Use AuthorRetrieval
        auth_retrieval = AuthorRetrieval(auth_retrieval_id)

        # Get current_aff_id
        aff_current_id = auth_search_df['affiliation_id']

        # Use ContentAffiliationRetrieval
        aff_current = ContentAffiliationRetrieval(aff_current_id)

        # Create scopus_dict
        scopus_dict = {'scopus idx': [scopus_search[i] for n in range(0, 1)],
                       'name': scopus_search[i][0] + ' ' + scopus_search[i][1],
                       'scopus_id': auth_retrieval_id,
                       'begin_publication_range': auth_retrieval.publication_range[0],
                       'end_publication_range': auth_retrieval_id.publication_range[1],
                       'document_count': auth_retrieval.document_count,
                       'coauthor_count': auth_retrieval.coauthor_count,
                       'citation_count': auth_retrieval.citation_count,
                       'h_index': auth_retrieval.h_index,
                       'cited_by_count': auth_retrieval.cited_by_count,
                       'aff_current_name_from_affid': aff_current.affiliation_name,
                       'aff_current_city_from_affid': aff_current.city,
                       'aff_current_state_from_affid': aff_current.state,
                       'aff_current_country_from_affid': aff_current.country,
                       'aff_current_auth_count': aff_current.author_count,
                       'aff_current_doc_count': aff_current.document_count}

        # Append scopus_dict to scopus
        scopus_dict_df = pd.DataFrame.from_dict(scopus_dict)
        scopus = scopus.append(scopus_dict_df)

        # Get journals
        journals_df = pd.DataFrame(auth_retrieval.get_documents())
        auth_journals = [scopus_search[i] for n in range(journals_df.shape[0] + 1)]
        journals_df['scopus_idx'] = pd.Series(auth_journals)

        # Append journals_df to jour
        jour = jour.append(journals_df)

        # Get coauthors
        coauthors_df = pd.DataFrame(auth_retrieval.get_coauthors())
        auth_coauthors = [scopus_search[i] for n in range(coauthors_df.shape[0] + 1)]
        coauthors_df['scopus_idx'] = pd.Series(auth_coauthors)

        # Append coauthors_df to coauth
        coauth = coauth.append(coauthors_df)

        # Get affiliations
        affs = au.affiliation_history
        for affil in affs:
            aff_retrieval = ContentAffiliationRetrieval(affil)
            # Create aff_dict
            aff_dict = {'scopus idx': [scopus_search[i] for n in range(0, 1)],
                        'aff_name': aff_retrieval.affiliation_name,
                        'aff_city': aff_retrieval.city,
                        'aff_state': aff_retrieval.state,
                        'aff_country': aff_retrieval.country,
                        'aff_author_count': aff_retrieval.author_count,
                        'aff_document_count': aff_retrieval.document_count}
            # Append aff_dict to aff
            aff_dict_df = pd.DataFrame.from_dict(former_aff_dict)
            aff = aff.append(aff_dict_df)

        print('Success: ' + str(i))
    except:
        print('Error: ' + str(i))

scopus.to_csv('scopus_data_0_500.csv')
jour.to_csv('journals_data_0_500.csv')
coauth.to_csv('coauthors_data_0_500.csv')
aff.to_csv('affiliations_data_0_500.csv')